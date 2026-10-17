# State Management

Martronics uses [Zustand](https://github.com/pmndrs/zustand) for global state management. Zustand provides a small, fast, and scalable bearbones state-management solution.

## Stores

The application state is divided into several stores, located in `src/stores/`.

### `authStore`
Manages user authentication state.
-   **State:**
    -   `user`: The current logged-in user object (or null).
    -   `isAuthenticated`: Boolean flag.
    -   `loading`: Boolean flag for async operations.
    -   `error`: Error message string.
-   **Actions:**
    -   `login(credentials)`: Authenticates user and sets token.
    -   `register(userData)`: Registers a new user.
    -   `logout()`: Clears user data and token.
    -   `checkAuth()`: Verifies token on app load.

### `cartStore`
Manages the shopping cart state.
-   **State:**
    -   `items`: Array of cart items.
    -   `total`: Total price of items in cart.
-   **Actions:**
    -   `fetchCart()`: Loads cart from backend.
    -   `addToCart(product, quantity)`: Adds item to cart.
    -   `removeFromCart(itemId)`: Removes item.
    -   `clearCart()`: Empties the cart.

### `productStore`
Manages product data.
-   **State:**
    -   `products`: Array of all products.
    -   `currentProduct`: Details of the currently viewed product.
-   **Actions:**
    -   `fetchProducts()`: Loads all products.
    -   `fetchProductById(id)`: Loads a single product.
    -   `createProduct(data)`: Admin action to add product.
    -   `updateProduct(id, data)`: Admin action to edit product.
    -   `deleteProduct(id)`: Admin action to remove product.

### `categoryStore`
Manages category data.
-   **State:**
    -   `categories`: Array of categories.
-   **Actions:**
    -   `fetchCategories()`: Loads categories.

## Usage Pattern

Components subscribe to the store using the hook returned by `create`.

```javascript
import useAuthStore from '../stores/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
};
```
