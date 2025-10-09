const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');

// native node module used to hash password
const crypto = require('crypto');

const app = express();
const PORT = 1234;

const url = 'mongodb://localhost:27017';
// used later to show collections
const dbName = 'comp3123_assignment1';

app.use(express.json());

// hashing password using crypto module, with the sha256 algorithm
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

MongoClient.connect(url)
  .then(client => {
    const db = client.db(dbName);
    console.log('MongoDB Connected Successfully');
    
    require('./routes/userRoutes')(app, db, hashPassword, body, validationResult);
    require('./routes/employeeRoutes')(app, db, ObjectId, body, validationResult);
    
    // start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  // error handling in case of connection error
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });