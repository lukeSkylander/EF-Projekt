// routes/products.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
	try {
		const { category, size } = req.query; // Filter by category or size

		let query = "SELECT * FROM products WHERE 1=1";
		const params = [];

		if (category) {
			params.push(category);
			query += ` AND category = $${params.length}`;
		}

		if (size) {
			params.push(size);
			query += ` AND size = $${params.length}`;
		}

		query += " ORDER BY category, name, size";

		const products = await db.any(query, params);
		res.json(products);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// GET single product
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const product = await db.oneOrNone("SELECT * FROM products WHERE id = $1", [
			id,
		]);

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		res.json(product);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
