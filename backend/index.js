// Import necessary modules (deprecated with require)
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize the app
const app = express();

app.use(cors())

// Load environment variables
dotenv.config();

// Middleware to parse JSON data
app.use(bodyParser.json());

// Define a basic route
app.get('/', (req, res) => {
    res.send('Welcome to my custom Node.js backend!');
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

