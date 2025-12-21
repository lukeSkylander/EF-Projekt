// index.js
import express from "express";
// import middleware from "./middleware/middleware.js";
// import auth from "./routes/auth.js";
// import users from "./routes/users.js";
// import products from "./routes/products.js";
// import addresses from "./routes/addresses.js";
// import orders from "./routes/orders.js";
// import cart from "./routes/cart.js";

const app = express(); // create an express app
const PORT = process.env.PORT || 5000;
export default app;

// Middleware
// app.use(express.json());

// Routes
// app.use("/auth", auth);
// app.use("/users", users);
// app.use("/products", products);
// app.use("/addresses", addresses);
// app.use("/orders", orders);
// app.use("/cart", cart);

app.get("/", (req, res) => res.send("Backend running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
