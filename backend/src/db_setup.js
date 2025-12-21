import pgPromise from "pg-promise";

const pgp = pgPromise();

// Create fresh connection for setup
const db = pgp(process.env.DATABASE_URL);

async function setupDatabase() {
	try {
		console.log("Setting up database...");

		// Drop existing tables
		await db.none("DROP TABLE IF EXISTS order_items CASCADE");
		await db.none("DROP TABLE IF EXISTS orders CASCADE");
		await db.none("DROP TABLE IF EXISTS cart CASCADE");
		await db.none("DROP TABLE IF EXISTS addresses CASCADE");
		await db.none("DROP TABLE IF EXISTS products CASCADE");
		await db.none("DROP TABLE IF EXISTS users CASCADE");

		console.log("Dropped existing tables");

		// Create users table
		await db.none(`  
            CREATE TABLE users (  
                id SERIAL PRIMARY KEY,  
                email VARCHAR(255) UNIQUE NOT NULL,  
                password_hash VARCHAR(255) NOT NULL,  
                name VARCHAR(255) NOT NULL,  
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
            )  
        `);

		// Create products table
		await db.none(`  
            CREATE TABLE products (  
                id SERIAL PRIMARY KEY,  
                name VARCHAR(255) NOT NULL,  
                description TEXT,  
                price DECIMAL(10, 2) NOT NULL,  
                category VARCHAR(50) NOT NULL,  
                size VARCHAR(10) NOT NULL,  
                color VARCHAR(50),  
                stock INTEGER DEFAULT 0,  
                image_url VARCHAR(500),  
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
            )  
        `);

		// Create addresses table
		await db.none(`
		          CREATE TABLE addresses (
		              id SERIAL PRIMARY KEY,
		              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		              street VARCHAR(255) NOT NULL,
		              city VARCHAR(100) NOT NULL,
		              postal_code VARCHAR(20) NOT NULL,
		              country VARCHAR(100) NOT NULL
		          )
		      `);

		// Create orders table
		await db.none(`
		          CREATE TABLE orders (
		              id SERIAL PRIMARY KEY,
		              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		              address_id INTEGER REFERENCES addresses(id),
		              total_price DECIMAL(10, 2) NOT NULL,
		              status VARCHAR(50) DEFAULT 'pending',
		              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		          )
		      `);

		// Create order_items table
		await db.none(`
		          CREATE TABLE order_items (
		              id SERIAL PRIMARY KEY,
		              order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
		              product_id INTEGER REFERENCES products(id),
		              quantity INTEGER NOT NULL,
		              price DECIMAL(10, 2) NOT NULL
		          )
		      `);

		// Create cart table
		await db.none(`
		          CREATE TABLE cart (
		              id SERIAL PRIMARY KEY,
		              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		              product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
		              quantity INTEGER DEFAULT 1,
		              UNIQUE(user_id, product_id)
		          )
		      `);

		console.log("Created all tables");

		// Insert sample products
		await db.none(`
		          INSERT INTO products (name, description, price, category, size, color, stock, image_url) VALUES
		          ('Classic Black Hoodie', 'Comfortable cotton hoodie', 49.99, 'hoodie', 'M', 'Black', 20, 'https://via.placeholder.com/300/000000/FFFFFF?text=Black+Hoodie'),
		          ('Classic Black Hoodie', 'Comfortable cotton hoodie', 49.99, 'hoodie', 'L', 'Black', 15, 'https://via.placeholder.com/300/000000/FFFFFF?text=Black+Hoodie'),
		('Grey Hoodie', 'Soft and warm', 54.99, 'hoodie', 'M', 'Grey', 18, 'https://via.placeholder.com/300/808080/FFFFFF?text=Grey+Hoodie'),
			('Grey Hoodie', 'Soft and warm', 54.99, 'hoodie', 'L', 'Grey', 12, 'https://via.placeholder.com/300/808080/FFFFFF?text=Grey+Hoodie'),
			('White T-Shirt', 'Classic cotton tee', 19.99, 't-shirt', 'M', 'White', 30, 'https://via.placeholder.com/300/FFFFFF/000000?text=White+Tee'),
			('White T-Shirt', 'Classic cotton tee', 19.99, 't-shirt', 'L', 'White', 25, 'https://via.placeholder.com/300/FFFFFF/000000?text=White+Tee'),
			('Black T-Shirt', 'Essential item', 19.99, 't-shirt', 'M', 'Black', 35, 'https://via.placeholder.com/300/000000/FFFFFF?text=Black+Tee'),
			('Black T-Shirt', 'Essential item', 19.99, 't-shirt', 'L', 'Black', 28, 'https://via.placeholder.com/300/000000/FFFFFF?text=Black+Tee')
				`);

		// console.log("Inserted sample products");
		console.log("Database setup complete!");
	} catch (err) {
		console.error("❌ Error:", err);
	} finally {
		await pgp.end(); // Properly close connection
	}
}

setupDatabase();
