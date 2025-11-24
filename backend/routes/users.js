const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
	"INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, 'customer', NOW())",
	[username, email, password_hash]
    );

    res.json({ message: "User registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(400).json({ message: "Invalid email" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

    res.json({ token });
});

// MIDDLEWARE
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];
    try {
	req.user = jwt.verify(token, process.env.JWT_SECRET);
	next();
    } catch {
	res.status(401).json({ message: "Invalid token" });
    }
}

// GET ME
router.get("/me", auth, async (req, res) => {
    const [rows] = await db.query("SELECT id, username, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
    res.json(rows[0]);
});

module.exports = router;

