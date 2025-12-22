// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import validator from "validator";
import dns from "dns/promises";

const router = express.Router();

// Check if email domain exists
async function hasMxRecord(email) {
	const domain = email.split("@")[1];
	try {
		const records = await dns.resolveMx(domain);
		return records.length > 0;
	} catch {
		return false;
	}
}

router.post("/register", async (req, res) => {
	try {
		const { email, password, name } = req.body;

		// Validate
		if (!email || !password || !name) {
			res.status(400).json({ error: "All fields required" });
		}

		if (!validator.isEmail(email)) {
			res.status(400).json({ error: "Provided email is of wrong format" });
		}

		if (!hasMxRecord(email)) {
			res.status(400).json({ error: "Email domain does not exist" });
		}

		// Check if users exists
		const existing = await db.oneOrNone(
			`SELECT * FROM users WHERE email = $1`,
			[email],
		);

		if (existing) {
			res.status(400).json({ error: "User already exists" });
		}
		// encrypt the password
		const salt = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(password, salt);

		// create a user
		const user = await db.one(
			`INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name `,
			[email, password_hash, name],
		);

		// create a token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" },
		);
		res.status(201).json({
			message: "User registered successfully",
			token,
			user,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error", details: err.message });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		// Validate input
		if (!email || !password) {
			res.status(400).json({ error: "All fields required" });
		}

		// Find user
		const user = await db.oneOrNone(`SELECT * FROM users WHERE email = $1`, [
			email,
		]);

		if (!user) {
			res.status(400).json({ error: "User doesn't exist" });
		}

		// Check password
		const validPassword = await bcrypt.compare(password, user.password_hash);
		console.log(user);

		if (!validPassword) {
			res.status(400).json({ error: "Wrong password" });
		}

		// Create JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" },
		);
		res.json({
			message: "Login successful",
			token,
			user,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
