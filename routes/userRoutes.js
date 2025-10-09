
// module used to handle user-related routes, such as signup and login
module.exports = (app, db, hashPassword, body, validationResult) => {
  
    // POST method to create a new user with username, email, and password (hashed)
    app.post('/api/v1/user/signup', [
      body('username').notEmpty().withMessage('Please enter a username'),
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('password').isLength({ min: 7 }).withMessage('Please enter a password with at least 7 characters')
    ], 
    // async function to handle the signup request
    async (req, res) => {
      try {
        // calls the validationResult function from the express-validator module in server.js and checks for validation errors
        const errors = validationResult(req);
        // if there are validation errors (errors array is not empty), returns a 400 status response
        if (!errors.isEmpty()) {
          return res.status(400).json({
            status: false,
            message: errors.array()[0].msg
          });
        }
  
        // gets the username, email, and password from the request body
        const { username, email, password } = req.body;
        // gets the users collection from the database
        const usersCollection = db.collection('users');
  
        // checks if the username or email already exists
        const existingUser = await usersCollection.findOne({
          $or: [{ username }, { email }]
        });
  
        // if the username or email already exists, returns a 400 status response with a pre-defined error message
        if (existingUser) {
          return res.status(400).json({
            status: false,
            message: 'Username or email already exists'
          });
        }
  
        // calls the hashPassword function from the crypto module in server.js
        const hashedPassword = hashPassword(password);
  
        // creates a new user object
        const newUser = {
          username,
          email,
          // the hashed password is used here
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        };
  
        // inserts the new user into the users collection (MongoDB) so that it can be accessed later
        const result = await usersCollection.insertOne(newUser);
  
        // if the insertion is successful, returns a success message, along with the user_id as confirmation and a 201 status response
        res.status(201).json({
          message: 'User created successfully.',
          user_id: result.insertedId.toString()
        });
        // if there is an error, logs the error and returns a 500 status response
      } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({
          status: false,
          // generic error message
          message: 'Server error'
        });
      }
    });
  
    // POST method to handle user login with username, email, and password
    app.post('/api/v1/user/login', [
      body('password').notEmpty().withMessage('Please enter your password')
    ], 
    // async function to handle the login request
    async (req, res) => {
      try {
        // calls the validationResult function from the express-validator module in server.js and checks for validation errors
        const errors = validationResult(req);
        // if there are validation errors (errors array is not empty), returns a 400 status response
        if (!errors.isEmpty()) {
          return res.status(400).json({
            status: false,
            // returns the first error message in the errors array
            message: errors.array()[0].msg
          });
        }
  
        // gets the username, email, and password from the request body
        const { email, username, password } = req.body;
        // gets the users collection from the database
        const usersCollection = db.collection('users');
  
        // checks if the username or email exists
        const user = await usersCollection.findOne({
          $or: [{ email }, { username }]
        });
  
        // if the username or email does not exist, returns a 400 status response with a pre-defined error message
        if (!user) {
          return res.status(400).json({
            status: false,
            message: 'Invalid Username and password'
          });
        }
  
        // calls the hashPassword function from the crypto module in server.js to hash the inputted password and compare it with the hashed password in the database
        const hashedInput = hashPassword(password);
        // if the hashed input does not match the hashed password in the database, returns a 400 status response with a pre-defined error message
        if (hashedInput !== user.password) {
          return res.status(400).json({
            status: false,
            message: 'Invalid Username and password'
          });
        }
  
        // if nothing goes wrong, returns a 200 status response with a success message, along with the user_id as confirmation
        res.status(200).json({
          message: 'Login successful.'
        });
        // if there is an error, logs the error and returns a 500 status response
      } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
          status: false,
          // generic error message
          message: 'Server error'
        });
      }
    });
  };