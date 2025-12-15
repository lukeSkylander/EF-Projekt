import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

console.log(process.env.DATABSE_URL)


const sql = `
/* ====== PRODUCTS ====== */
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price DECIMAL(8,2) NOT NULL,
  brand VARCHAR(50) NOT NULL DEFAULT 'Twigga',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* Basic color versions (variants) + stock */
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  color_hex CHAR(7) DEFAULT NULL,
  sku VARCHAR(64) UNIQUE,
  price_delta DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOL NOT NULL DEFAULT TRUE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_product_color (product_id, color_name)
) ENGINE=InnoDB;

/* ====== FINISHED DESIGNS ====== */
CREATE TABLE IF NOT EXISTS designs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  preview_url VARCHAR(255) NOT NULL,   -- shop preview image
  extra_price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  is_active BOOL NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* Which areas a design includes (front/back/sleeves) */
CREATE TABLE IF NOT EXISTS design_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  design_id INT NOT NULL,
  area ENUM('front','back','left_sleeve','right_sleeve') NOT NULL,
  asset_url VARCHAR(255) NOT NULL,     -- print file for that area (SVG/PNG)
  FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_design_area (design_id, area)
) ENGINE=InnoDB;

/* ====== COMPATIBILITY: which designs are allowed for which product types ====== */
CREATE TABLE IF NOT EXISTS product_designs (
  product_id INT NOT NULL,
  design_id INT NOT NULL,
  PRIMARY KEY (product_id, design_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ====== ORDER ITEMS (1 finished design per item) ======
   Requires existing: orders(id)
   Requires existing: product_variants(id)
*/
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  variant_id INT NOT NULL,
  design_id INT NOT NULL,
  quantity INT NOT NULL,

  unit_base_price DECIMAL(8,2) NOT NULL,   -- snapshot: products.base_price + variants.price_delta
  unit_design_price DECIMAL(8,2) NOT NULL, -- snapshot: designs.extra_price

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (design_id) REFERENCES designs(id)
) ENGINE=InnoDB;

/* ====== Optional: enforce compatibility in the DB (trigger) ====== */
DROP TRIGGER IF EXISTS trg_check_design_product;

DELIMITER $$
CREATE TRIGGER trg_check_design_product
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM product_variants pv
    JOIN product_designs pd ON pd.product_id = pv.product_id
    WHERE pv.id = NEW.variant_id
      AND pd.design_id = NEW.design_id
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Design not compatible with product';
  END IF;
END$$
DELIMITER ;
`;

async function main() {
  await pool.query(sql);
  await pool.end();
  console.log("Schema created/updated successfully.");
}

main().catch(async (err) => {
  console.error(err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
