const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = 'comp3123_assignment1';

app.use(express.json());

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

// Serverless connection cache for Vercel
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });
  }
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

// Middleware to attach DB and load routes
app.use(async (req, res, next) => {
  try {
    const db = await getDb();
    req.db = db;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database Connection Error', details: err.message });
  }
});

// Import routes inside HTTP handler to ensure DB is available
require('../routes/userRoutes')(app, null, hashPassword, body, validationResult);
require('../routes/employeeRoutes')(app, null, ObjectId, body, validationResult);

app.get('/', (req, res) =>
  res.json({ message: 'Employee Management API', status: true })
);

module.exports = app;
