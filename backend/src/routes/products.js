const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all products
router.get("/", async (req, res) => {
    try {
	const [products] = await db.query("SELECT * FROM products");
	res.json(products);
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: "Error fetching products" });
    }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
    try {
	const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
	if (rows.length === 0) {
	    return res.status(404).json({ message: "Product not found" });
	}
	res.json(rows[0]);
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: "Error fetching product" });
    }
});

// CREATE new product (admin only recommended)
router.post("/", async (req, res) => {
    const { name, description, price, stock, brand } = req.body;

    if (!name || !price || !stock || !brand) {
	return res.status(400).json({ message: "Missing required fields" });
    }

    try {
	const [result] = await db.query(
	    `INSERT INTO products (id, name, description, price, stock, brand)
	    VALUES (NULL, ?, ?, ?, ?, ?)`,
	    [name, description, price, stock, brand]
	);

	res.json({ message: "Product created", product_id: result.insertId });
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: "Error creating product" });
    }
});

// UPDATE product (admin only)
router.put("/:id", async (req, res) => {
    const { name, description, price, stock, brand } = req.body;

    try {
	const [result] = await db.query(
	    `UPDATE products SET name = ?, description = ?, price = ?, stock = ?, brand = ?
	    WHERE id = ?`,
	    [name, description, price, stock, brand, req.params.id]
	);

	if (result.affectedRows === 0) {
	    return res.status(404).json({ message: "Product not found" });
	}

	res.json({ message: "Product updated" });
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: "Error updating product" });
    }
});

// DELETE product (admin only)
router.delete("/:id", async (req, res) => {
    try {
	const [result] = await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);

	if (result.affectedRows === 0) {
	    return res.status(404).json({ message: "Product not found" });
	}

	res.json({ message: "Product deleted" });
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: "Error deleting product" });
    }
});

module.exports = router;

