// routes/orders.js
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticateToken);

// CREATE order from cart
router.post("/", async (req, res) => {
	try {
		const userId = req.user.userId;
		const { address_id } = req.body;

		if (!address_id) {
			return res.status(400).json({ error: "Address ID required" });
		}

		// Start transaction
		await db
			.tx(async (t) => {
				// Get cart items
				const cartItems = await t.any(
					`  
                SELECT c.product_id, c.quantity, p.price, p.stock, p.name  
                FROM cart c  
                JOIN products p ON c.product_id = p.id  
                WHERE c.user_id = $1  
            `,
					[userId],
				);

				if (cartItems.length === 0) {
					throw new Error("Cart is empty");
				}

				// Check stock
				for (const item of cartItems) {
					if (item.stock < item.quantity) {
						throw new Error(`Not enough stock for ${item.name}`);
					}
				}

				// Calculate total
				const total = cartItems.reduce(
					(sum, item) => sum + item.quantity * parseFloat(item.price),
					0,
				);

				// Create order
				const order = await t.one(
					"INSERT INTO orders (user_id, address_id, total_price, status) VALUES ($1, $2, $3, $4) RETURNING *",
					[userId, address_id, total.toFixed(2), "pending"],
				);

				// Create order items & update stock
				for (const item of cartItems) {
					await t.none(
						"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
						[order.id, item.product_id, item.quantity, item.price],
					);

					await t.none("UPDATE products SET stock = stock - $1 WHERE id = $2", [
						item.quantity,
						item.product_id,
					]);
				}

				// Clear cart
				await t.none("DELETE FROM cart WHERE user_id = $1", [userId]);

				return order;
			})
			.then((order) => {
				res.json({
					message: "Order created successfully",
					order,
				});
			});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
});

// GET user's orders
router.get("/", async (req, res) => {
	try {
		const userId = req.user.userId;

		const orders = await db.any(
			`  
            SELECT   
                o.id,  
                o.total_price,  
                o.status,  
                o.created_at,  
                json_agg(  
                    json_build_object(  
                        'product_id', oi.product_id,  
                        'quantity', oi.quantity,  
                        'price', oi.price,  
                        'name', p.name,  
                        'category', p.category,  
                        'size', p.size,  
                        'color', p.color  
                    )  
                ) as items  
            FROM orders o  
            LEFT JOIN order_items oi ON o.id = oi.order_id  
            LEFT JOIN products p ON oi.product_id = p.id  
            WHERE o.user_id = $1  
            GROUP BY o.id  
            ORDER BY o.created_at DESC  
        `,
			[userId],
		);

		res.json(orders);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// GET single order
router.get("/:id", async (req, res) => {
	try {
		const userId = req.user.userId;
		const { id } = req.params;

		const order = await db.oneOrNone(
			`  
            SELECT   
                o.*,  
                json_agg(  
                    json_build_object(  
                        'product_id', oi.product_id,  
                        'quantity', oi.quantity,  
                        'price', oi.price,  
                        'name', p.name,  
                        'category', p.category,  
                        'size', p.size,  
                        'color', p.color  
                    )  
                ) as items  
            FROM orders o  
            LEFT JOIN order_items oi ON o.id = oi.order_id  
            LEFT JOIN products p ON oi.product_id = p.id  
            WHERE o.id = $1 AND o.user_id = $2  
            GROUP BY o.id  
        `,
			[id, userId],
		);

		if (!order) {
			return res.status(404).json({ error: "Order not found" });
		}

		res.json(order);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
