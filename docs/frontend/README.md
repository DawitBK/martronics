# Frontend Documentation

The Martronics frontend is a Single Page Application (SPA) built with React and Vite. It uses Tailwind CSS for styling and Zustand for state management.

## Architecture

The frontend is structured around functional components and hooks.
-   **Pages:** Top-level components representing routes (e.g., Home, Product Details, Cart).
-   **Components:** Reusable UI elements (e.g., Navbar, ProductCard, Button).
-   **Stores:** Global state management using Zustand.
-   **API:** Axios instances and service functions for communicating with the backend.

## Folder Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── api/            # API service functions
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── pages/          # Route components
│   ├── stores/         # Zustand stores
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles (Tailwind imports)
├── index.html          # HTML template
├── tailwind.config.cjs # Tailwind configuration
└── vite.config.js      # Vite configuration
```

## Styling

We use **Tailwind CSS** for styling.
-   Utility classes are used directly in JSX.
-   Global styles and custom utilities are defined in `src/index.css`.
-   Configuration (colors, fonts, breakpoints) is managed in `tailwind.config.cjs`.

## Routing

**React Router v6** is used for client-side routing.
Routes are defined in `src/App.jsx`.
-   `/`: Home Page
-   `/login`: Login Page
-   `/register`: Registration Page
-   `/products`: Product Listing
-   `/products/:id`: Product Details
-   `/cart`: Shopping Cart
-   `/profile`: User Profile

## Running the Frontend

To start the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```
