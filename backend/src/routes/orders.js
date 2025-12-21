const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// AUTH
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing token" });
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
}

// CREATE ORDER
router.post("/create", auth, async (req, res) => {
    const { items } = req.body; 
    // items = [{ product_id, quantity }, ...]

    let total = 0;

    // Calculate total
    for (const item of items) {
	const [[product]] = await db.query("SELECT price, stock FROM products WHERE id = ?", [item.product_id]);
	if (!product) return res.status(400).json({ message: "Product not found" });
	if (product.stock < item.quantity)
	    return res.status(400).json({ message: "Not enough stock for product " + item.product_id });

	total += product.price * item.quantity;
    }

    total = total.toFixed(2);

    // Create order
    const [result] = await db.query(
	"INSERT INTO orders (id, user_id, total, status, created_at) VALUES (NULL, ?, ?, 'pending', NOW())",
	[req.user.id, total]
    );
    const orderId = result.insertId;

    // Insert order items + reduce stock
    for (const item of items) {
	const [[product]] = await db.query("SELECT price FROM products WHERE id = ?", [item.product_id]);

	await db.query(
	    "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (NULL, ?, ?, ?, ?)",
	    [orderId, item.product_id, item.quantity, product.price]
	);

	await db.query(
	    "UPDATE products SET stock = stock - ? WHERE id = ?",
	    [item.quantity, item.product_id]
	);
    }

    res.json({ message: "Order created", order_id: orderId });
});

// GET MY ORDERS
router.get("/", auth, async (req, res) => {
    const [orders] = await db.query("SELECT * FROM orders WHERE user_id = ?", [req.user.id]);
    res.json(orders);
});

// GET ORDER DETAILS
router.get("/:id", auth, async (req, res) => {
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

    const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);

    res.json({ order: orders[0], items });
});

module.exports = router;

