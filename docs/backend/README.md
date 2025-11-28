# Backend Documentation

The Martronics backend is a RESTful API built with Node.js and Express. It handles data persistence using PostgreSQL and Sequelize, and secures endpoints using JWT authentication.

## Architecture

The backend follows the Model-View-Controller (MVC) pattern (although "View" is the API response):

-   **Controllers:** Handle incoming requests, process business logic, and send responses. Located in `controllers/`.
-   **Models:** Define the database schema and relationships. Located in `models/`.
-   **Routes:** Define the API endpoints and map them to controller functions. Located in `routes/`.
-   **Middleware:** Functions that execute during the request-response cycle (e.g., authentication, error handling). Located in `middleware/`.

## Folder Structure

```
backend/
├── config/         # Configuration files (database, etc.)
├── controllers/    # Request handlers
├── db/             # Database connection logic
├── middleware/     # Custom middleware
├── models/         # Sequelize models
├── routes/         # API route definitions
├── scripts/        # Utility scripts
├── app.js          # Main application entry point
└── package.json    # Dependencies and scripts
```

## Configuration

The application is configured using environment variables. Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Key Technologies

-   **Express:** Fast, unopinionated, minimalist web framework for Node.js.
-   **Sequelize:** Promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.
-   **Passport:** Authentication middleware for Node.js (if used, otherwise custom JWT implementation).
-   **Swagger UI Express:** Auto-generated API documentation.

## Running the Backend

To start the backend server in development mode with hot reloading (using nodemon):

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```
