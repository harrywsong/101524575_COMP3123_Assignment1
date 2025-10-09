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
let isInitialized = false;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  try {
    console.log('Attempting MongoDB connection...');
    
    // Connection options for MongoDB v5.x with Vercel compatibility
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid IPv6 issues
    };

    const client = await MongoClient.connect(MONGODB_URI, options);
    cachedDb = client.db(dbName);
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}

// Initialize routes once
async function initializeRoutes() {
  if (isInitialized) return;
  
  try {
    console.log('Initializing routes...');
    const db = await connectToDatabase();
    
    // Load routes AFTER database connection
    require('../routes/userRoutes')(app, db, hashPassword, body, validationResult);
    require('../routes/employeeRoutes')(app, db, ObjectId, body, validationResult);
    
    isInitialized = true;
    console.log('Routes initialized successfully');
  } catch (error) {
    console.error('Route Initialization Error:', error);
    throw error;
  }
}

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Employee Management API', status: true });
});

// Middleware to ensure routes are initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeRoutes();
    next();
  } catch (error) {
    console.error('Middleware Error:', error);
    res.status(500).json({
      status: false,
      message: 'Server initialization error',
      error: error.message
    });
  }
});

module.exports = app;