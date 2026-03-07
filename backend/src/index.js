require('dotenv').config();          // load .env variables (MONGODB_URI, PORT)
const express = require('express');
const connectDB = require('./config/db'); // <-- db.js
const app = express();
app.use(express.json());
// simple health‑check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// start everything
connectDB();                         // establish MongoDB connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));