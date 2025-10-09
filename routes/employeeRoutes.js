module.exports = (app, db, ObjectId, body, validationResult) => {

    // GET /api/v1/emp/employees
    app.get('/api/v1/emp/employees', async (req, res) => {
      try {
        const employeesCollection = db.collection('employees');
        const employees = await employeesCollection.find({}).toArray();
  
        const formattedEmployees = employees.map(emp => ({
          employee_id: emp._id.toString(),
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          position: emp.position,
          salary: emp.salary,
          date_of_joining: emp.date_of_joining,
          department: emp.department
        }));
  
        res.status(200).json(formattedEmployees);
      } catch (error) {
        console.error('Get All Employees Error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error'
        });
      }
    });
  
    // POST /api/v1/emp/employees
    app.post('/api/v1/emp/employees', [
      body('first_name').notEmpty().withMessage('First name is required'),
      body('last_name').notEmpty().withMessage('Last name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('position').notEmpty().withMessage('Position is required'),
      body('salary').isNumeric().withMessage('Salary must be a number'),
      body('date_of_joining').notEmpty().withMessage('Date of joining is required'),
      body('department').notEmpty().withMessage('Department is required')
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            status: false,
            message: errors.array()[0].msg
          });
        }
  
        const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;
        const employeesCollection = db.collection('employees');
  
        const existingEmployee = await employeesCollection.findOne({ email });
        if (existingEmployee) {
          return res.status(400).json({
            status: false,
            message: 'Employee with this email already exists'
          });
        }
  
        const newEmployee = {
          first_name,
          last_name,
          email,
          position,
          salary: Number(salary),
          date_of_joining: new Date(date_of_joining),
          department,
          created_at: new Date(),
          updated_at: new Date()
        };
  
        const result = await employeesCollection.insertOne(newEmployee);
  
        res.status(201).json({
          message: 'Employee created successfully.',
          employee_id: result.insertedId.toString()
        });
      } catch (error) {
        console.error('Create Employee Error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error'
        });
      }
    });
  
    // GET /api/v1/emp/employees/:eid
    app.get('/api/v1/emp/employees/:eid', async (req, res) => {
      try {
        const { eid } = req.params;
        const employeesCollection = db.collection('employees');
  
        if (!ObjectId.isValid(eid)) {
          return res.status(400).json({
            status: false,
            message: 'Invalid employee ID'
          });
        }
  
        const employee = await employeesCollection.findOne({ _id: new ObjectId(eid) });
  
        if (!employee) {
          return res.status(404).json({
            status: false,
            message: 'Employee not found'
          });
        }
  
        const formattedEmployee = {
          employee_id: employee._id.toString(),
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          position: employee.position,
          salary: employee.salary,
          date_of_joining: employee.date_of_joining,
          department: employee.department
        };
  
        res.status(200).json(formattedEmployee);
      } catch (error) {
        console.error('Get Employee By ID Error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error'
        });
      }
    });
  
    // PUT /api/v1/emp/employees/:eid
    app.put('/api/v1/emp/employees/:eid', async (req, res) => {
        try {
        const { eid } = req.params;
        const updateData = { ...req.body }; // Create a copy of the body
        const employeesCollection = db.collection('employees');
    
        // Check if body is empty
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
            status: false,
            message: 'No update data provided'
            });
        }
    
        // Validate ObjectId
        if (!ObjectId.isValid(eid)) {
            return res.status(400).json({
            status: false,
            message: 'Invalid employee ID'
            });
        }
    
        // Convert salary to number if provided
        if (updateData.salary !== undefined) {
            updateData.salary = Number(updateData.salary);
        }
    
        // Convert date if provided
        if (updateData.date_of_joining !== undefined) {
            updateData.date_of_joining = new Date(updateData.date_of_joining);
        }
    
        // Add updated_at timestamp
        updateData.updated_at = new Date();
    
        const result = await employeesCollection.updateOne(
            { _id: new ObjectId(eid) },
            { $set: updateData }
        );
    
        if (result.matchedCount === 0) {
            return res.status(404).json({
            status: false,
            message: 'Employee not found'
            });
        }
    
        res.status(200).json({
            message: 'Employee details updated successfully.'
        });
        } catch (error) {
        console.error('Update Employee Error:', error);
        res.status(500).json({
            status: false,
            message: 'Server error'
        });
        }
    });
  
    // DELETE /api/v1/emp/employees?eid=xxx
    app.delete('/api/v1/emp/employees', async (req, res) => {
      try {
        const { eid } = req.query;
  
        if (!eid) {
          return res.status(400).json({
            status: false,
            message: 'Employee ID is required'
          });
        }
  
        const employeesCollection = db.collection('employees');
  
        if (!ObjectId.isValid(eid)) {
          return res.status(400).json({
            status: false,
            message: 'Invalid employee ID'
          });
        }
  
        const result = await employeesCollection.deleteOne({ _id: new ObjectId(eid) });
  
        if (result.deletedCount === 0) {
          return res.status(404).json({
            status: false,
            message: 'Employee not found'
          });
        }
  
        res.status(204).send();
      } catch (error) {
        console.error('Delete Employee Error:', error);
        res.status(500).json({
          status: false,
          message: 'Server error'
        });
      }
    });
  };