// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

const router = express.Router();

router.post("/register", async (req, res) => {
	const { username, password } = req.body;

	// encrypt the password
	const hashedPassword = bcrypt.hashSync(password, 8);

	// save the new user and the password to the db
	try {
		db.none(`INSERT INTO users (username, password)
	    VALUES (${username}, ${hashedPassword})`);

		// create a token
		const token = jwt.sign(
			{ id: result.lastInsertRowid },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" },
		);
		res.json({ token });
	} catch (err) {
		console.log(err.message);
		// Server has broken down
		res.sendStatus(503);
	}
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
