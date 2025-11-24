const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// AUTH MIDDLEWARE
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing token" });
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
}

// GET ALL ADDRESSES
router.get("/", auth, async (req, res) => {
    const [rows] = await db.query("SELECT * FROM addresses WHERE user_id = ?", [req.user.id]);
    res.json(rows);
});

// ADD ADDRESS
router.post("/", auth, async (req, res) => {
    const { street, zip, city, canton, is_default } = req.body;

    if (is_default) {
	// unset all other defaults
	await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    }

    await db.query(
	"INSERT INTO addresses (id, user_id, street, zip, city, canton, is_default) VALUES (NULL, ?, ?, ?, ?, ?, ?)",
	[req.user.id, street, zip, city, canton, is_default]
    );

    res.json({ message: "Address added" });
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
    await db.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Address deleted" });
});

module.exports = router;

