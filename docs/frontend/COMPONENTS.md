# Component Documentation

This document provides an overview of the key React components used in the application.

## Layout Components

### `Navbar`
-   **Path:** `src/components/layout/Navbar.jsx`
-   **Description:** The main navigation bar. Displays links to Home, Products, Cart, and User Profile. Adapts to mobile screens with a hamburger menu.
-   **Props:** None (connects to stores).

### `Footer`
-   **Path:** `src/components/layout/Footer.jsx`
-   **Description:** The site footer containing copyright info and links.

## Product Components

### `ProductCard`
-   **Path:** `src/components/products/ProductCard.jsx`
-   **Description:** Displays a summary of a product (image, name, price). Includes an "Add to Cart" button.
-   **Props:** `product` (Object).

### `ProductList`
-   **Path:** `src/components/products/ProductList.jsx`
-   **Description:** Renders a grid of `ProductCard` components.

### `FeaturedProducts`
-   **Path:** `src/components/products/FeaturedProducts.jsx`
-   **Description:** Displays a carousel or grid of featured products on the homepage.

## Cart Components

### `CartItem`
-   **Path:** `src/components/cart/CartItem.jsx`
-   **Description:** Displays a single item in the cart with quantity controls and a remove button.

### `CartSummary`
-   **Path:** `src/components/cart/CartSummary.jsx`
-   **Description:** Shows the total price and a "Checkout" button.

## Auth Components

### `LoginForm`
-   **Path:** `src/components/auth/LoginForm.jsx`
-   **Description:** Form for user login.

### `RegisterForm`
-   **Path:** `src/components/auth/RegisterForm.jsx`
-   **Description:** Form for new user registration.

## Common UI Components

Reusable UI elements found in `src/components/common/` (if applicable) or built with Tailwind classes.
-   **Buttons:** Styled using Tailwind utility classes (e.g., `bg-blue-600 hover:bg-blue-700`).
-   **Inputs:** Standard HTML inputs styled with Tailwind.
-   **Modals:** Used for confirmations or detailed views.
