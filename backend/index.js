// Import necessary modules (deprecated with require)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize the app
const app = express();

app.use(cors())
app.use(express.json()); // <-- parse JSON bodies

// Load environment variables
dotenv.config();

// Homepage
app.get("/", (req, res) => {
  res.json({ message: "Homepage" });
});

// Example route
app.get("/api/", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('server listening on port 8080')
})

