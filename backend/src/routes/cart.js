// routes/cart.js
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All cart routes need login
router.use(authenticateToken);

// GET user's cart
router.get("/", async (req, res) => {
	try {
		const userId = req.user.userId;

		const items = await db.any(
			`  
            SELECT   
                c.id,  
                c.quantity,  
                p.id as product_id,  
                p.name,  
                p.price,  
                p.category,  
                p.size,  
                p.color,  
                p.image_url,  
                (c.quantity * p.price) as subtotal  
            FROM cart c  
            JOIN products p ON c.product_id = p.id  
            WHERE c.user_id = $1  
            ORDER BY c.id  
        `,
			[userId],
		);

		const total = items.reduce(
			(sum, item) => sum + parseFloat(item.subtotal),
			0,
		);

		res.json({
			items,
			total: total.toFixed(2),
			count: items.reduce((sum, item) => sum + item.quantity, 0),
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// ADD to cart
router.post("/", async (req, res) => {
	try {
		const userId = req.user.userId;
		const { product_id, quantity = 1 } = req.body;

		// Check product exists
		const product = await db.oneOrNone("SELECT * FROM products WHERE id = $1", [
			product_id,
		]);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		// Check if already in cart
		const existing = await db.oneOrNone(
			"SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
			[userId, product_id],
		);

		if (existing) {
			// Update quantity
			const updated = await db.one(
				"UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
				[quantity, userId, product_id],
			);
			res.json({ message: "Cart updated", item: updated });
		} else {
			// Add new item
			const newItem = await db.one(
				"INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
				[userId, product_id, quantity],
			);
			res.json({ message: "Added to cart", item: newItem });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// UPDATE quantity
router.put("/:id", async (req, res) => {
	try {
		const userId = req.user.userId;
		const { id } = req.params;
		const { quantity } = req.body;

		if (quantity < 1) {
			return res.status(400).json({ error: "Quantity must be at least 1" });
		}

		const updated = await db.oneOrNone(
			"UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
			[quantity, id, userId],
		);

		if (!updated) {
			return res.status(404).json({ error: "Cart item not found" });
		}

		res.json({ message: "Quantity updated", item: updated });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE from cart
router.delete("/:id", async (req, res) => {
	try {
		const userId = req.user.userId;
		const { id } = req.params;

		const deleted = await db.oneOrNone(
			"DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *",
			[id, userId],
		);

		if (!deleted) {
			return res.status(404).json({ error: "Cart item not found" });
		}

		res.json({ message: "Item removed from cart" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
