// routes/addresses.js
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticateToken);

// GET user's addresses
router.get("/", async (req, res) => {
	try {
		const addresses = await db.any(
			"SELECT * FROM addresses WHERE user_id = $1",
			[req.user.userId],
		);
		res.json(addresses);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

// CREATE address
router.post("/", async (req, res) => {
	try {
		const { street, city, postal_code, country } = req.body;

		if (!street || !city || !postal_code || !country) {
			return res.status(400).json({ error: "All fields required" });
		}

		const address = await db.one(
			"INSERT INTO addresses (user_id, street, city, postal_code, country) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[req.user.userId, street, city, postal_code, country],
		);

		res.json(address);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// UPDATE address
router.put("/:id", async (req, res) => {
	try {
		const { street, city, postal_code, country } = req.body;

		const address = await db.oneOrNone(
			`UPDATE addresses   
             SET street = COALESCE($1, street),   
                 city = COALESCE($2, city),   
                 postal_code = COALESCE($3, postal_code),  
                 country = COALESCE($4, country)  
             WHERE id = $5 AND user_id = $6   
             RETURNING *`,
			[street, city, postal_code, country, req.params.id, req.user.userId],
		);

		if (!address) {
			return res.status(404).json({ error: "Address not found" });
		}

		res.json(address);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

// DELETE address
router.delete("/:id", async (req, res) => {
	try {
		const deleted = await db.oneOrNone(
			"DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *",
			[req.params.id, req.user.userId],
		);

		if (!deleted) {
			return res.status(404).json({ error: "Address not found" });
		}

		res.json({ message: "Address deleted" });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
