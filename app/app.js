const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// GET / - Welcome, environment, and author
app.get('/', (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the Midterm Evaluation API!",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    author: process.env.AUTHOR || "Cloud Engineer Intern"
  });
});

// GET /health - Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// GET /headers - Request headers inspector
app.get('/headers', (req, res) => {
  res.json({
    message: "Request headers list",
    headers: req.headers
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
