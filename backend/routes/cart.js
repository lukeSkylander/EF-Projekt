// routes/cart.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { auth } = require("../middleware/auth");

// GET cart
router.get("/", auth, async (req, res) => {
    const [items] = await db.query(
	`SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.stock 
	FROM cart_items ci
	JOIN products p ON ci.product_id = p.id
	WHERE ci.user_id = ?`,
	[req.user.id]
    );
    res.json(items);
});

// ADD item
router.post("/add", auth, async (req, res) => {
    const { product_id, quantity } = req.body;

    const [[product]] = await db.query(
	"SELECT stock FROM products WHERE id = ?",
	[product_id]
    );

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity)
	return res.status(400).json({ message: "Not enough stock" });

    // If item already exists
    const [[existing]] = await db.query(
	"SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
	[req.user.id, product_id]
    );

    if (existing) {
	await db.query(
	    "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
	    [quantity, existing.id]
	);
    } else {
	await db.query(
	    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
	    [req.user.id, product_id, quantity]
	);
    }

    res.json({ message: "Item added to cart" });
});

// REMOVE item
router.delete("/remove/:id", auth, async (req, res) => {
    await db.query("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [
	req.params.id,
	req.user.id,
    ]);

    res.json({ message: "Item removed" });
});

// CLEAR CART
router.delete("/clear", auth, async (req, res) => {
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Cart cleared" });
});

module.exports = router;

