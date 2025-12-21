import dotenv from "dotenv";
import pkg from "pg";

const { Client } = pkg;

dotenv.config();

console.log(process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const sql = `
/* ====== ENUMS ====== */
DO $$ BEGIN
  CREATE TYPE design_area AS ENUM ('front','back','left_sleeve','right_sleeve');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

/* ====== PRODUCTS ====== */
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price NUMERIC(8,2) NOT NULL,
  brand VARCHAR(50) NOT NULL DEFAULT 'Twigga',
  created_at TIMESTAMPTZ DEFAULT now()
);

/* ====== PRODUCT VARIANTS ====== */
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(50) NOT NULL,
  color_hex CHAR(7),
  sku VARCHAR(64) UNIQUE,
  price_delta NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (product_id, color_name)
);

/* ====== DESIGNS ====== */
CREATE TABLE IF NOT EXISTS designs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  preview_url VARCHAR(255) NOT NULL,
  extra_price NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

/* ====== DESIGN PARTS ====== */
CREATE TABLE IF NOT EXISTS design_parts (
  id SERIAL PRIMARY KEY,
  design_id INT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  area design_area NOT NULL,
  asset_url VARCHAR(255) NOT NULL,
  UNIQUE (design_id, area)
);

/* ====== PRODUCT ↔ DESIGN COMPATIBILITY ====== */
CREATE TABLE IF NOT EXISTS product_designs (
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  design_id INT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, design_id)
);

/* ====== ORDERS (REQUIRED) ====== */
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

/* ====== ORDER ITEMS ====== */
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id INT NOT NULL REFERENCES product_variants(id),
  design_id INT NOT NULL REFERENCES designs(id),
  quantity INT NOT NULL,
  unit_base_price NUMERIC(8,2) NOT NULL,
  unit_design_price NUMERIC(8,2) NOT NULL
);

/* ====== TRIGGER FUNCTION ====== */
CREATE OR REPLACE FUNCTION check_design_product()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM product_variants pv
    JOIN product_designs pd ON pd.product_id = pv.product_id
    WHERE pv.id = NEW.variant_id
      AND pd.design_id = NEW.design_id
  ) THEN
    RAISE EXCEPTION 'Design not compatible with product';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* ====== TRIGGER ====== */
DROP TRIGGER IF EXISTS trg_check_design_product ON order_items;

CREATE TRIGGER trg_check_design_product
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION check_design_product();
`;

async function main() {
  await client.connect();
  await client.query(sql);
  await client.end();

  console.log("PostgreSQL schema created successfully.");
}

main().catch(async (err) => {
  console.error(err);
  try { await client.end(); } catch {}
  process.exit(1);
});

