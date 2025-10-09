
***

# COMP3123 Assignment 1 – Employee Management API

This is an Express.js + MongoDB REST API for employee management with endpoints for user signup, login, and employee CRUD operations.


### Prerequisites

- Node.js
- MongoDB
- Express.js

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harrywsong/101524575_COMP3123_Assignment1.git
   cd 101524575_COMP3123_Assignment1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
  - For local dev: `mongodb://localhost:27017`
  - For Vercel/serverless: MongoDB Atlas connection URI

### Running the Project

- **Local Development:**
  ```bash
  npm run dev
  ```
  The API will run by default on `http://localhost:3000`.

- **Production:**
  ```bash
  npm start
  ```

### API Endpoints

#### User 

- **Sign Up**: `POST /api/v1/user/signup`
  - `username`, `email`, `password` (min 7 chars, password is hashed)
- **Login**: `POST /api/v1/user/login`
  - Accepts `email` or `username`, and `password`

#### Employee 

- **GET**:   `/api/v1/emp/employees` (all employees)
- **GET**:   `/api/v1/emp/employees/:eid` (by ID)
- **POST**:  `/api/v1/emp/employees`
- **PUT**:   `/api/v1/emp/employees/:eid`
- **DELETE**:`/api/v1/emp/employees?eid=EMPLOYEE_ID`

### Notes

- All passwords are hashed using Node.js `crypto` and SHA-256.
- Input validation is handled by `express-validator`.
- The API is Vercel-ready.
- For local, adjust use db connection in `server.js`.

***
