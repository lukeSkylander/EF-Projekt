// middleware/auth.js
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Bearer Token
	if (!token) {
		res.status(401).json({ error: "Access denied. No token provided" });
	}
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		next(); // User is good to go
	} catch (err) {
		res.status(403).json({ error: "Invalid token" });
	}
};
