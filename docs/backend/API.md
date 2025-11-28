# API Documentation

The Martronics API provides endpoints for managing users, products, orders, categories, and more.

## Design Principles

-   **RESTful:** The API follows REST architectural constraints.
-   **JSON:** All requests and responses are in JSON format.
-   **Stateless:** No client context is stored on the server between requests.

## Authentication

Authentication is handled via JSON Web Tokens (JWT).
-   **Login:** Users obtain a token by providing valid credentials to the `/api/users/login` endpoint.
-   **Authorization Header:** Protected endpoints require the token to be sent in the `Authorization` header: `Bearer <token>`.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request.
-   `200 OK`: Request succeeded.
-   `201 Created`: Resource successfully created.
-   `400 Bad Request`: Invalid input or request parameters.
-   `401 Unauthorized`: Authentication failed or missing token.
-   `403 Forbidden`: Authenticated user does not have permission.
-   `404 Not Found`: Resource not found.
-   `500 Internal Server Error`: Server-side error.

## Routes Overview

For a complete and interactive API reference, please run the backend and visit `/api-docs` (Swagger UI).

### Users (`/api/users`)
-   `POST /register`: Register a new user.
-   `POST /login`: Authenticate a user.
-   `GET /profile`: Get current user profile.
-   `PUT /profile`: Update user profile.

### Products (`/api/products`)
-   `GET /`: List all products (supports filtering/pagination).
-   `GET /:id`: Get product details.
-   `POST /`: Create a new product (Admin only).
-   `PUT /:id`: Update a product (Admin only).
-   `DELETE /:id`: Delete a product (Admin only).

### Categories (`/api/categories`)
-   `GET /`: List all categories.
-   `POST /`: Create a category (Admin only).

### Orders (`/api/orders`)
-   `POST /`: Create a new order.
-   `GET /`: List user's orders.
-   `GET /:id`: Get order details.

### Cart (`/api/cart`)
-   `GET /`: Get current user's cart.
-   `POST /add`: Add item to cart.
-   `DELETE /remove/:itemId`: Remove item from cart.
-   `DELETE /clear`: Clear the cart.

## Swagger Documentation

The project includes auto-generated Swagger documentation.
To view it:
1.  Start the backend server (`npm start` or `npm run dev`).
2.  Navigate to `http://localhost:5000/api-docs` in your browser.
