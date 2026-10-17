# Martronics Project Documentation

Welcome to the Martronics project documentation. This documentation provides a comprehensive guide to the architecture, setup, and development of the Martronics e-commerce platform.

## Project Overview

Martronics is a full-stack e-commerce application designed to provide a seamless shopping experience for electronics. It features a modern, responsive frontend built with React and a robust backend API built with Node.js and Express.

## Technology Stack

### Frontend
- **Framework:** [React](https://react.dev/) (v19)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Routing:** [React Router](https://reactrouter.com/) (v6)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Notifications:** [React Toastify](https://fkhadra.github.io/react-toastify/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** PostgreSQL
- **ORM:** [Sequelize](https://sequelize.org/)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt (Password Hashing), cors
- **Documentation:** Swagger (OpenAPI)

### Tools & DevOps
- **Version Control:** Git & GitHub
- **Deployment:** Vercel (Frontend), Vercel/Railway (Backend)
- **Database Hosting:** Neon / Railway

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd martronics
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    npm start
    ```
    The backend server will start on `http://localhost:5000` (or the port specified in your `.env`).

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend development server will start on `http://localhost:5173`.

## Documentation Structure

- **[Backend Documentation](./backend/README.md):** Detailed guide to the backend architecture, API, and database.
    - [API Reference](./backend/API.md)
    - [Database Schema](./backend/DATABASE.md)
- **[Frontend Documentation](./frontend/README.md):** Guide to the frontend architecture, components, and state management.
    - [Components](./frontend/COMPONENTS.md)
    - [State Management](./frontend/STATE_MANAGEMENT.md)
- **[Deployment Guide](./DEPLOYMENT.md):** Instructions for building and deploying the application.
