import pgPromise from "pg-promise";

const pgp = pgPromise();

// Verbindung herstellen
const db = pgp(process.env.DATABASE_URL);

async function setupDatabase() {
	try {
		console.log("Setting up database with exported data...");

		// 1. Drop existing tables (Reihenfolge ist wichtig wegen Foreign Keys)
		await db.none("DROP TABLE IF EXISTS order_items CASCADE");
		await db.none("DROP TABLE IF EXISTS orders CASCADE");
		await db.none("DROP TABLE IF EXISTS cart CASCADE");
		await db.none("DROP TABLE IF EXISTS addresses CASCADE");
		await db.none("DROP TABLE IF EXISTS products CASCADE");
		await db.none("DROP TABLE IF EXISTS users CASCADE");

		console.log("Dropped existing tables");

		// 2. Create Tables

		// Users
		await db.none(`  
            CREATE TABLE users (  
                id SERIAL PRIMARY KEY,  
                email VARCHAR(255) UNIQUE NOT NULL,  
                password_hash VARCHAR(255) NOT NULL,  
                name VARCHAR(255) NOT NULL,  
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
            )  
        `);

		// Products
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

		// Addresses
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

		// Orders
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

		// Order Items
		await db.none(`
            CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL
            )
        `);

		// Cart
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

		// 3. Insert Data from Export
		// WICHTIG: Wir fügen die IDs explizit ein, um die Relationen zu erhalten.

		// Insert Users
		await db.none(`
            INSERT INTO users (id, email, password_hash, name, created_at) VALUES
            (6, 'adhossner@gmail.com', '$2b$10$Ysa3AyaIpyY0ZSX/YYrJxehcajvQXkaoHmjKUsj9LXUFZWDP0is4y', 'Adrian', '2025-12-21T19:41:52.566Z'),
            (7, 'Lucaulrich06@gmail.com', '$2b$10$/owAcUTStR9TjwO7EcpviO3PSzi5rtkS1TUov4BLsod3ahRpZtKcG', 'luegge', '2025-12-21T20:17:04.622Z'),
            (8, 'eee@gmail.com', '$2b$10$9UFy93MaeDmkp4xiOJwTr.WQ2Z9eWeLQHWEygttrkMjmQPFbsvKGC', 'eee', '2025-12-22T10:10:21.761Z'),
            (9, 'gilgamesh@gma', '$2b$10$fY0JZNt44P0NYwRyROmI4.a1IcIfxFPARaHUFriCgVBidlkkM.nhO', 'gilgamesh', '2025-12-22T10:22:08.557Z'),
            (11, 'gilgamesh@gma.com', '$2b$10$YzcWAG2UHetOdzGsHxXf7.QV4uel5uwhNNWAiFsTGMj3jKA/gQGVC', 'gilga', '2025-12-22T10:26:26.879Z'),
            (12, 'gilgamesh@g.com', '$2b$10$anEZgLUb9Mia1d4m1g1q3eNPzUVSBUXccSMh4VlnFbjvRNooITAsO', 'gilga', '2025-12-22T10:27:15.037Z'),
            (14, 'gilgamesh@gmail.com', '$2b$10$hqwm1nXRSVJqu0XbFBOXauribG3A0kC8YGJp3RvlHxTIu13ewEf4y', 'gilgamesh', '2025-12-22T10:52:39.871Z'),
            (15, 'adho@mail.com', '$2b$10$VXO3tOSGDU5zvQWNYTNjMuyFrQlOD5bODNoRHgwKazuKtXUWpJx1y', 'adho', '2025-12-22T14:14:07.966Z'),
            (16, 'adhello@mail.com', '$2b$10$d7eHYsxVNaYDLY8iTH8BB.0GxJTLv47GWTSBbwmKARBdt1c91BWXq', 'hello', '2025-12-22T14:18:52.301Z'),
            (17, 'cecile@gmail.com', '$2b$10$gvEq4XC5dZuerA4VFteRJemIwKNEoWF3ymwQNtdOF44WbMFx/BXPG', 'Cecile', '2025-12-22T15:05:21.906Z'),
            (18, 'test@gmail.com', '$2b$10$jULY/lzEBhMEB7TG57t3CeZJn.7VmTpfalM1Aw879xYcjRrd6oPPS', 'test', '2025-12-22T18:22:31.440Z'),
            (20, 'testuser@example.com', '$2b$10$h1WzFX0oxPYZII5O3X9IzuSksgb1gvI7Tj/sGxr3CjOo4eNW29PZ2', 'testuser', '2025-12-22T18:28:27.249Z')
        `);

		// Insert Products
		await db.none(`
    INSERT INTO products (id, name, description, price, category, size, color, stock, image_url, created_at) VALUES
    (10, 'White T-Shirt', 'Classic cotton tee', 19.99, 't-shirt', 'S', 'white', 9, 'https://via.placeholder.com/300/FFFFFF/000000?text=White+Tee', '2025-12-22T14:56:04.000Z'),
    (11, 'Red T-Shirt', 'Classic cotton tee', 19.99, 't-shirt', 'S', 'red', 7, 'https://via.placeholder.com/300/FFFFFF/000000?text=Red+Tee', '2025-12-22T14:56:56.115Z'),
    (12, 'Pink T-Shirt', 'Classic cotton tee', 19.99, 't-shirt', 'S', 'pink', 14, 'https://via.placeholder.com/300/FFFFFF/000000?text=Pink+Tee', '2025-12-22T14:57:50.431Z'),
    (13, 'Gray T-Shirt', 'Classic cotton tee', 19.99, 't-shirt', 'S', 'gray', 2, 'https://via.placeholder.com/300/FFFFFF/000000?text=Gray+Tee', '2025-12-22T14:58:46.895Z'),
    (14, 'Black T-Shirt', 'Classic cotton Tee', 19.99, 't-shirt', 'S', 'black', 5, 'https://via.placeholder.com/300/FFFFFF/000000?text=black+Tee', '2025-12-22T14:59:36.159Z'),
    (15, 'White Longsleeve', 'Classic Longsleeve T-Shirt', 27.99, 't-shirt', 'S', 'white', 6, 'https://via.placeholder.com/300/FFFFFF/000000?text=White+Longsleeve', '2025-12-22T15:03:01.000Z'),
    (16, 'Red Longsleeve', 'Classic Longsleeve T-Shirt', 27.99, 't-shirt', 'S', 'red', 7, 'https://via.placeholder.com/300/FFFFFF/000000?text=Red+Longsleeve', '2025-12-22T15:04:25.145Z'),
    (17, 'Pink Longsleeve', 'Classic Longsleeve T-Shirt', 27.99, 't-shirt', 'S', 'pink', 6, 'https://via.placeholder.com/300/FFFFFF/000000?text=Pink+Longsleeve', '2025-12-22T15:05:12.000Z'),
    (18, 'Gray Longsleeve', 'Classic Longsleeve T-Shirt', 27.99, 't-shirt', 'S', 'gray', 11, 'https://via.placeholder.com/300/FFFFFF/000000?text=Gray+Longsleeve', '2025-12-22T15:06:54.178Z'),
    (19, 'Black Longsleeve', 'Classic Longsleeve T-Shirt', 27.99, 't-shirt', 'S', 'black', 14, 'https://via.placeholder.com/300/FFFFFF/000000?text=Black+Longsleeve', '2025-12-22T15:07:48.000Z'),
    (20, 'White Knit Sweater', 'Soft and comfortable knit sweater', 54.99, 'hoodie', 'S', 'white', 6, 'https://via.placeholder.com/300/FFFFFF/000000?text=White+Knit', '2025-12-22T16:31:43.833Z'),
    (21, 'Red Knit Sweater', 'Soft and comfortable knit sweater', 54.99, 'hoodie', 'S', 'red', 12, 'https://github.com/lukeSkylander/EF-Projekt/blob/main/frontend/public/productimages/knit-red.jpg', '2025-12-22T16:32:23.000Z'),
    (22, 'Pink Knit Sweater', 'Soft and comfortable knit sweater', 54.99, 'hoodie', 'S', 'pink', 18, 'https://via.placeholder.com/300/FFFFFF/000000?text=Pink+Knit', '2025-12-22T16:33:56.433Z'),
    (24, 'Gray Knit Sweater', 'Soft and comfortable knit sweater', 54.99, 'hoodie', 'S', 'gray', 7, 'https://via.placeholder.com/300/FFFFFF/000000?text=Gray+Knit', '2025-12-22T16:35:06.084Z'),
    (25, 'Black Knit Sweater', 'Soft and comfortable knit sweater', 54.99, 'hoodie', 'S', 'black', 12, 'https://via.placeholder.com/300/FFFFFF/000000?text=Black+Knit', '2025-12-22T16:36:00.897Z')
`);

		// Insert Addresses
		await db.none(`
    INSERT INTO addresses (id, user_id, street, city, postal_code, country) VALUES
    (3, 7, 'Mattenstrasse 18A', 'Thun', '3600', 'Switzerland'),
    (4, 7, 'Mattenstrasse 18A', 'Thun', '3600', 'Switzerland'),
    (5, 14, 'Meisenweg 12', 'Hilterfingen', '3652', 'Switzerland'),
    (6, 14, 'Meisenweg 12', 'Thun', '3600', 'Switzerland'),
    (7, 14, 'jjjuj 34', 'Thun', '3600', 'Switzerland'),
    (8, 14, 'jjjuj 34', 'Thun', '3600', 'Switzerland'),
    (9, 14, 'Meisenweg 12', 'Hilterfingen', '3652', 'Switzerland'),
    (10, 17, 'Frutigenstrasse 2', 'Thun', '3600', 'Switzerland'),
    (11, 17, 'Frutigenstrasse 2', 'Thun', '3600', 'Switzerland'),
    (12, 17, 'Frutigenstrasse 2', 'Thun', '3600', 'Switzerland'),
    (13, 17, 'Frutigenstrasse 2', 'Thun', '3600', 'Switzerland'),
    (14, 7, 'Mattenstrasse 18A', 'Thun', '3600', 'Switzerland')
`);

		// Insert Orders
		await db.none(`
    INSERT INTO orders (id, user_id, address_id, total_price, status, created_at) VALUES
    (4, 7, 3, 99.98, 'pending', '2025-12-21T20:20:35.824Z'),
    (5, 7, 4, 909.74, 'pending', '2025-12-21T20:25:54.373Z'),
    (6, 14, 5, 39.98, 'pending', '2025-12-22T10:56:05.149Z'),
    (7, 14, 6, 59.97, 'pending', '2025-12-22T10:57:14.226Z'),
    (8, 14, 8, 49.99, 'pending', '2025-12-22T11:00:51.127Z'),
    (9, 14, 9, 49.99, 'pending', '2025-12-22T11:02:39.346Z'),
    (10, 17, 13, 164.97, 'pending', '2025-12-22T15:06:50.351Z'),
    (11, 7, 14, 139.95, 'pending', '2025-12-22T17:27:54.086Z')
`);

		// Insert Order Items
		await db.none(`
    INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES
    (15, 11, 19, 5, 27.99)
`);

		console.log("Inserted all data from export");

		// 4. Reset Sequences
		await db.any(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
		await db.any(
			`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`,
		);
		await db.any(
			`SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM addresses))`,
		);
		await db.any(
			`SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders))`,
		);
		await db.any(
			`SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items))`,
		);
		await db.any(
			`SELECT setval('cart_id_seq', COALESCE((SELECT MAX(id) FROM cart), 1))`,
		);

		console.log("Sequences reset done.");
		console.log("Database setup complete!");
	} catch (err) {
		console.error("❌ Error:", err);
	} finally {
		await pgp.end();
	}
}

setupDatabase();
