// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
import db from "../db.js";

// REGISTER
router.post("/register", async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password)
		return res.status(400).json({ message: "Missing fields" });

	const hash = await bcrypt.hash(password, 10);

	await db.query(
		`INSERT INTO users (id, username, email, password_hash, role, created_at)
	VALUES (NULL, ?, ?, ?, 'customer', NOW())`,
		[username, email, hash],
	);

	res.json({ message: "Registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
	if (rows.length === 0)
		return res.status(400).json({ message: "Invalid email" });

	const user = rows[0];
	const valid = await bcrypt.compare(password, user.password_hash);
	if (!valid) return res.status(400).json({ message: "Invalid password" });

	const token = jwt.sign(
		{ id: user.id, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: "7d" },
	);

	res.json({ token });
});

module.exports = router;
