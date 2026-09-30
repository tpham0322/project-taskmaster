# TaskMaster REST API

## Overview

TaskMaster is a secure REST API for managing users, projects, and tasks.

The API was built using Node.js, Express, MongoDB, and Mongoose. Authentication is handled using JSON Web Tokens (JWT), and user passwords are securely hashed using bcrypt.

### Features

- User registration
- User login
- JWT authentication
- Project CRUD operations
- Task CRUD operations
- Project ownership authorization
- Task ownership authorization
- MongoDB data persistence
- Protected API routes

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- JSON Web Token (JWT)
- dotenv
- Nodemon

---

## Project Structure

taskmaster/
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Project.js
│   └── Task.js
├── routes/
│   └── api/
│       ├── userRoutes.js
│       ├── projectRoutes.js
│       └── taskRoutes.js
├── utils/
│   └── authMiddleware.js
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js

---

## Installation

### 1. Clone the Repository

    git clone YOUR_GITHUB_REPOSITORY_URL

### 2. Navigate Into the Project

    cd taskmaster

### 3. Install Dependencies

    npm install

---

## Environment Variables

Create a `.env` file in the root directory.

    MONGO_URI=your_mongodb_connection_string
    PORT=3000
    JWT_SECRET=your_secure_jwt_secret

### Environment Variable Descriptions

| Variable | Description |
|---|---|
| MONGO_URI | MongoDB connection string |
| PORT | Port used by the Express server |
| JWT_SECRET | Secret used to sign and verify JWT tokens |

The `.env` file must not be committed to GitHub.

---

## Running the Server

### Development Mode

    npm run dev

### Normal Mode

    npm start

The server will run at:

    http://localhost:3000

---

# Authentication

TaskMaster uses JWT authentication to protect project and task routes.

Protected requests require the following HTTP header:

    Authorization: Bearer YOUR_JWT_TOKEN

A JWT is generated when a user successfully logs in.

---

# API Endpoints

## User Routes

### Register

    POST /api/users/register

Request body:

    {
      "username": "user1",
      "email": "user1@example.com",
      "password": "password123"
    }

Successful response:

    {
      "message": "User registered successfully",
      "user": {
        "id": "USER_ID",
        "username": "user1",
        "email": "user1@example.com"
      }
    }

---

### Login

    POST /api/users/login

Request body:

    {
      "email": "user1@example.com",
      "password": "password123"
    }

Successful response:

    {
      "message": "Login successful",
      "token": "YOUR_JWT_TOKEN"
    }

The returned token is required for protected endpoints.

---

# Project Routes

All project routes require authentication.

## Create Project

    POST /api/projects

Request body:

    {
      "name": "TaskMaster Project",
      "description": "My first TaskMaster project"
    }

The authenticated user automatically becomes the project owner.

---

## Get All Projects

    GET /api/projects

Returns only projects owned by the authenticated user.

---

## Get One Project

    GET /api/projects/:id

Example:

    GET /api/projects/65abcdef1234567890abcdef

Users can only retrieve projects they own.

---

## Update Project

    PUT /api/projects/:id

Request body:

    {
      "name": "Updated Project",
      "description": "Updated project description"
    }

Users can only update projects they own.

---

## Delete Project

    DELETE /api/projects/:id

Users can only delete projects they own.

Successful response:

    {
      "message": "Project deleted successfully"
    }

---

# Task Routes

All task routes require authentication.

## Create Task

    POST /api/projects/:projectId/tasks

Request body:

    {
      "title": "Build API",
      "description": "Finish the TaskMaster REST API",
      "status": "To Do"
    }

Allowed statuses:

- To Do
- In Progress
- Done

The task is automatically associated with the specified project.

The authenticated user must own the project.

---

## Get Project Tasks

    GET /api/projects/:projectId/tasks

Returns all tasks belonging to the specified project.

The authenticated user must own the project.

---

## Update Task

    PUT /api/tasks/:taskId

Request body:

    {
      "title": "Finish API",
      "description": "Complete API testing",
      "status": "In Progress"
    }

The API verifies:

1. The task exists.
2. The parent project exists.
3. The authenticated user owns the parent project.

---

## Delete Task

    DELETE /api/tasks/:taskId

The API verifies ownership through the task's parent project before deleting it.

Successful response:

    {
      "message": "Task deleted successfully"
    }

---

# Data Models

## User

User
├── username
├── email
└── password

Passwords are hashed using bcrypt before being stored in MongoDB.

---

## Project

Project
├── name
├── description
└── user

The `user` field references the User who owns the project.

---

## Task

Task
├── title
├── description
├── status
└── project

The `project` field references the Project that owns the task.

---

# Relationships

User
 │
 │ owns
 ▼
Project
 │
 │ contains
 ▼
Task

A user can have multiple projects.

A project can contain multiple tasks.

Each project belongs to one user.

Each task belongs to one project.

---

# Authorization

TaskMaster uses ownership-based authorization.

Example:

User 1
└── Project A
    ├── Task 1
    └── Task 2

User 2
└── Project B
    └── Task 3

User 1 cannot access, update, or delete User 2's project or tasks.

Unauthorized ownership attempts return:

    403 Forbidden

Requests without a valid JWT return:

    401 Unauthorized

---

# Security Features

The API includes:

- Password hashing with bcrypt
- JWT-based authentication
- Protected project routes
- Protected task routes
- Ownership authorization
- Environment variables for sensitive configuration
- `.env` excluded from Git
- JWT expiration
- MongoDB ObjectId relationships

---

# Testing

The API was tested using Postman.

## Authentication Tests

    POST /api/users/register
    POST /api/users/login

## Project Tests

    POST /api/projects
    GET /api/projects
    GET /api/projects/:id
    PUT /api/projects/:id
    DELETE /api/projects/:id

## Task Tests

    POST /api/projects/:projectId/tasks
    GET /api/projects/:projectId/tasks
    PUT /api/tasks/:taskId
    DELETE /api/tasks/:taskId

## Authorization Tests

The following authorization scenarios should be tested:

- Requests without a JWT are rejected.
- User 1 can access User 1's projects.
- User 2 cannot access User 1's projects.
- User 2 cannot modify User 1's projects.
- User 2 cannot delete User 1's projects.
- User 2 cannot modify User 1's tasks.
- User 2 cannot delete User 1's tasks.

---

# Example Authorization Header

In Postman, select:

Authorization → Bearer Token

Then enter:

    YOUR_JWT_TOKEN

Postman will send:

    Authorization: Bearer YOUR_JWT_TOKEN

---

# Error Responses

## Missing Authentication

    {
      "message": "No authorization token provided"
    }

Status:

    401 Unauthorized

---

## Invalid Authentication

    {
      "message": "Invalid or expired token"
    }

Status:

    401 Unauthorized

---

## Unauthorized Resource Access

    {
      "message": "Forbidden: You do not own this project"
    }

Status:

    403 Forbidden

---

## Resource Not Found

    {
      "message": "Project not found"
    }

Status:

    404 Not Found

---

# Git Security

The `.env` file must never be committed to GitHub.

The `.gitignore` file contains:

    node_modules/
    .env

Before pushing the project, verify your Git status:

    git status

Make sure `.env` is not listed as a file that will be committed.

---

# Future Improvements

Possible future improvements include:

- Input validation
- Pagination for projects and tasks
- Search and filtering
- Password reset functionality
- Refresh tokens
- Role-based authorization
- Swagger API documentation
- Automated unit and integration tests
- Centralized error handling
- Cascade deletion of tasks when a project is deleted

---

# Author

Truong Pham

Computer Science Graduate

---

# Project Summary

TaskMaster demonstrates a complete backend REST API using Node.js, Express, MongoDB, and Mongoose.

The project demonstrates:

- REST API development
- Express routing
- MongoDB database integration
- Mongoose schemas and relationships
- Password hashing
- JWT authentication
- Authorization
- CRUD operations
- Protected resources
- Environment variable management
- API testing