const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// MongoDB connection
const url = 'mongodb://localhost:27017';
const dbName = 'comp3123_assigment1';

app.use(express.json());

// Password hashing
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Connect to MongoDB first, then start server
MongoClient.connect(url)
  .then(client => {
    const db = client.db(dbName);
    console.log('MongoDB Connected Successfully');
    
    // Import routes and pass db
    require('./routes/userRoutes')(app, db, hashPassword, body, validationResult);
    require('./routes/employeeRoutes')(app, db, ObjectId, body, validationResult);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });