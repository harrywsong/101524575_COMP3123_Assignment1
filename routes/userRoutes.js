module.exports = (app, db, hashPassword, body, validationResult) => {
  
    // POST /api/v1/user/signup
    app.post('/api/v1/user/signup', [
      body('username').notEmpty().withMessage('Username is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            status: false,
            message: errors.array()[0].msg
          });
        }
  
        const { username, email, password } = req.body;
        const usersCollection = db.collection('users');
  
        const existingUser = await usersCollection.findOne({
          $or: [{ username }, { email }]
        });
  
        if (existingUser) {
          return res.status(400).json({
            status: false,
            message: 'Username or email already exists'
          });
        }
  
        const hashedPassword = hashPassword(password);
  
        const newUser = {
          username,
          email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        };
  
        const result = await usersCollection.insertOne(newUser);
  
        res.status(201).json({
          message: 'User created successfully.',
          user_id: result.insertedId.toString()
        });
      } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error'
        });
      }
    });
  
    // POST /api/v1/user/login
    app.post('/api/v1/user/login', [
      body('password').notEmpty().withMessage('Password is required')
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            status: false,
            message: errors.array()[0].msg
          });
        }
  
        const { email, username, password } = req.body;
        const usersCollection = db.collection('users');
  
        const user = await usersCollection.findOne({
          $or: [{ email }, { username }]
        });
  
        if (!user) {
          return res.status(400).json({
            status: false,
            message: 'Invalid Username and password'
          });
        }
  
        const hashedInput = hashPassword(password);
        if (hashedInput !== user.password) {
          return res.status(400).json({
            status: false,
            message: 'Invalid Username and password'
          });
        }
  
        res.status(200).json({
          message: 'Login successful.'
        });
      } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error'
        });
      }
    });
  };