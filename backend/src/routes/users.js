// routes/users.js
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticateToken);

// GET current user profile
router.get("/me", async (req, res) => {
	try {
		const user = await db.one(
			"SELECT id, email, name, created_at FROM users WHERE id = $1",
			[req.user.userId],
		);
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

// UPDATE user profile
router.put("/me", async (req, res) => {
	try {
		const { name, email } = req.body;

		const user = await db.one(
			"UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, email, name",
			[name, email, req.user.userId],
		);

		res.json({ message: "Profile updated", user });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE user profile
router.delete("/me", async (req, res) => {
	try {
		await db.none("DELETE FROM users WHERE id = $1", [req.user.userId]);
		res.json({ message: "Profile deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
