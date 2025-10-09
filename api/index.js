const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = 'comp3123_assignment1';

app.use(express.json());

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Cache for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client.db(dbName);
  return cachedDb;
}

// Connect and setup routes
connectToDatabase().then(db => {
  // Load your existing routes - EXACTLY as they are
  require('../routes/userRoutes')(app, db, hashPassword, body, validationResult);
  require('../routes/employeeRoutes')(app, db, ObjectId, body, validationResult);
});

app.get('/', (req, res) => {
  res.json({ message: 'Employee Management API', status: true });
});

module.exports = app;