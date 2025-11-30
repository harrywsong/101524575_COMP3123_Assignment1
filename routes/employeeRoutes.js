// module used to handle employee-related routes
module.exports = (app, db, ObjectId, body, validationResult) => {

  // GET method to get all employees in the database
  app.get('/api/v1/emp/employees', async (req, res) => {
    try {
      // gets the employees collection from the database (use req.db for serverless or db for local)
      const employeesCollection = (req.db || db).collection('employees');
      // finds all employees in the collection and sets them to an array called employees
      const employees = await employeesCollection.find({}).toArray();

      // formats the employees data by converting ObjectId to string
      const formattedEmployees = employees.map(emp => ({
        employee_id: emp._id.toString(),
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        position: emp.position,
        salary: emp.salary,
        date_of_joining: emp.date_of_joining,
        department: emp.department,
        profile_picture: emp.profile_picture || null
      }));

      // sends the formatted employees data as a JSON response with a status code of 200 if successful
      res.status(200).json(formattedEmployees);
      // if there is an error, logs the error to the console and responds with a status code of 500
    } catch (error) {
      console.error('Get All Employees Error:', error);
      res.status(500).json({
        status: false,
        // generic error message
        message: 'Server error'
      });
    }
  });

  // ASSIGNMENT 2 - ADDED ENDPOINT
  // GET method to search employees by department or position
  app.get('/api/v1/emp/employees/search', async (req, res) => {
    try {
      // Get query parameters
      const { department, position } = req.query;
      
      // Get the employees collection from the database (use req.db for serverless or db for local)
      const employeesCollection = (req.db || db).collection('employees');
      
      // Build query object
      const query = {};
      if (department) {
        query.department = department;
      }
      if (position) {
        query.position = position;
      }
      
      // If no search criteria provided, return all employees
      // Otherwise, search based on provided criteria
      const employees = await employeesCollection.find(query).toArray();
      
      // Return the search results
      res.status(200).json(employees);
    } catch (error) {
      console.error('Search Error:', error);
      res.status(500).json({
        status: false,
        message: 'Server error'
      });
    }
  });

  // POST method to create a new employee, checks that each field is valid (not empty or not a number etc)
  app.post('/api/v1/emp/employees', [
    body('first_name').notEmpty().withMessage('Please enter a first name'),
    body('last_name').notEmpty().withMessage('Please enter a last name'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('position').notEmpty().withMessage('Please enter a position'),
    body('salary').isNumeric().withMessage('Please enter a valid salary (numeric)'),
    body('date_of_joining').notEmpty().withMessage('Please enter a date of joining'),
    body('department').notEmpty().withMessage('Please enter a department')
  ], 
  // async function to handle the create employee request
  async (req, res) => {
    try {
      // calls the validationResult function from the express-validator module in server.js and checks for validation errors
      const errors = validationResult(req);
      // if there are validation errors (errors array is not empty), returns a 400 status response
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          // the error message is the first message in the errors array
          message: errors.array()[0].msg
        });
      }

      // gets the first name, last name, email, position, salary, date of joining, department, and profile_picture from the request body
      const { first_name, last_name, email, position, salary, date_of_joining, department, profile_picture } = req.body;
      // gets the employees collection from the database (use req.db for serverless or db for local)
      const employeesCollection = (req.db || db).collection('employees');

      // checks if the email already exists
      const existingEmployee = await employeesCollection.findOne({ email });
      // if the email already exists, returns a 400 status response with a pre-defined error message
      if (existingEmployee) {
        return res.status(400).json({
          status: false,
          message: 'Employee with this email already exists'
        });
      }

      // creates a new employee object with the provided fields and sets the created_at and updated_at fields to the current date in UTC
      const newEmployee = {
        first_name,
        last_name,
        email,
        position,
        salary: Number(salary),
        date_of_joining: new Date(date_of_joining),
        department,
        profile_picture: profile_picture || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // inserts the newly created employee data into the employees collection
      const result = await employeesCollection.insertOne(newEmployee);

      // if nothing goes wrong, returns a 201 status response with a pre-defined success message and the employee ID as confirmation
      res.status(201).json({
        message: 'Employee created successfully.',
        employee_id: result.insertedId.toString()
      });
      // if there is an error, logs the error to the console and responds with a status code of 500
    } catch (error) {
      console.error('Create Employee Error:', error);
      res.status(500).json({
        status: false,
        // generic error message
        message: 'Server error'
      });
    }
  });

  // GET method to get an employee by ID from the database
  app.get('/api/v1/emp/employees/:eid', async (req, res) => {
    try {
      // tries to get the employee ID from the request parameters
      const { eid } = req.params;
      // gets the employees collection from the database (use req.db for serverless or db for local)
      const employeesCollection = (req.db || db).collection('employees');

      // if the employee ID is not a valid ObjectId, returns a 400 status response with a pre-defined error message
      if (!ObjectId.isValid(eid)) {
        return res.status(400).json({
          status: false,
          message: 'Invalid employee ID'
        });
      }

      // tries to find the employee with the provided ID
      const employee = await employeesCollection.findOne({ _id: new ObjectId(eid) });

      // if the employee is not found, returns a 404 status response with a pre-defined error message
      if (!employee) {
        return res.status(404).json({
          status: false,
          message: 'Employee not found'
        });
      }

      // sets the employee data to a variable called formattedEmployee
      const formattedEmployee = {
        employee_id: employee._id.toString(),
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        position: employee.position,
        salary: employee.salary,
        date_of_joining: employee.date_of_joining,
        department: employee.department,
        profile_picture: employee.profile_picture || null
      };

      // if nothing goes wrong, returns a 200 status response with the formatted employee data
      res.status(200).json(formattedEmployee);
      // if there is an error, logs the error to the console and responds with a status code of 500
    } catch (error) {
      console.error('Get Employee By ID Error:', error);
      res.status(500).json({
        status: false,
        // generic error message
        message: 'Server error'
      });
    }
  });

  // PUT method to update an employee by ID
  app.put('/api/v1/emp/employees/:eid', async (req, res) => {
      try {
      // tries to get the employee ID from the request parameters (the ID of the employee to be updated)
      const { eid } = req.params;
      // sets the inputted updated data to a variable called updateData
      const updateData = { ...req.body };
      // gets the employees collection from the database (use req.db for serverless or db for local)
      const employeesCollection = (req.db || db).collection('employees');
  
      // checks if no update data is provided (the request body is empty), and returns a 400 status response with a pre-defined error message if it is empty
      if (!updateData || Object.keys(updateData).length === 0) {
          return res.status(400).json({
          status: false,
          message: 'No update data provided'
          });
      }
  
      // if the employee ID is not a valid ObjectId, returns a 400 status response with a pre-defined error message
      if (!ObjectId.isValid(eid)) {
          return res.status(400).json({
          status: false,
          message: 'Invalid employee ID'
          });
      }
  
      // if the salary is provided (not undefined), converts it to a number and updates the "salary" field of the employee
      if (updateData.salary !== undefined) {
          updateData.salary = Number(updateData.salary);
      }
  
      // if the date_of_joining is provided (not undefined), converts it to a Date object and updates the "date_of_joining" field of the employee
      if (updateData.date_of_joining !== undefined) {
          updateData.date_of_joining = new Date(updateData.date_of_joining);
      }
  
      // sets the current date and time to the "updated_at" field of the employee being updated
      updateData.updated_at = new Date();
  
      // sets the updated data to the employee with the provided ID (updateOne is a method from the MongoDB library that is specifically used for updating documents in a collection)
      const result = await employeesCollection.updateOne(
          { _id: new ObjectId(eid) },
          { $set: updateData }
      );
  
      // if no employee is found with the provided ID, returns a 404 status response with a pre-defined error message
      if (result.matchedCount === 0) {
          return res.status(404).json({
          status: false,
          message: 'Employee not found'
          });
      }
  
      // if nothing goes wrong, returns a 200 status response with a success message
      res.status(200).json({
          message: 'Employee details updated successfully.'
      });
      // if there is an error, logs the error to the console and responds with a status code of 500
      } catch (error) {
      console.error('Update Employee Error:', error);
      res.status(500).json({
          status: false,
          // generic error message
          message: 'Server error'
      });
      }
  });

  // DELETE method to delete an employee by ID
  app.delete('/api/v1/emp/employees', async (req, res) => {
    try {
      // tries to get the employee ID from the request query parameters
      const { eid } = req.query;

      // if the employee ID is not provided or is not a valid ObjectId, returns a 400 status response with a pre-defined error message
      if (!eid) {
        return res.status(400).json({
          status: false,
          message: 'Employee ID is required'
        });
      }

      // gets the employees collection from the database (use req.db for serverless or db for local)
      const employeesCollection = (req.db || db).collection('employees');

      // if the employee ID is not a valid ObjectId, returns a 400 status response with a pre-defined error message
      if (!ObjectId.isValid(eid)) {
        return res.status(400).json({
          status: false,
          message: 'Invalid employee ID'
        });
      }

      // deletes the employee with the provided ID (deleteOne is a method from the MongoDB library that is specifically used for deleting documents in a collection)
      const result = await employeesCollection.deleteOne({ _id: new ObjectId(eid) });

      // if no employee is found with the provided ID, returns a 404 status response with a pre-defined error message
      if (result.deletedCount === 0) {
        return res.status(404).json({
          status: false,
          message: 'Employee not found'
        });
      }

      // if nothing goes wrong, returns a 204 status response, meaning "no content", which is used to indicate that the request was successful as it does not exist anymore
      res.status(204).send();
      // if there is an error, logs the error to the console and responds with a status code of 500
    } catch (error) {
      console.error('Delete Employee Error:', error);
      res.status(500).json({
        status: false,
        // generic error message
        message: 'Server error'
      });
    }
  });
};