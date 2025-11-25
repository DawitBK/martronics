// import api from "./axios";

// // Cart
// export const listCarts = () => api.get("/cart");
// export const getCartByUser = (userId) => api.get(`/cart/user/${userId}`);
// export const createCart = (userId) => api.post("/cart", { user_id: userId });
// export const deleteCart = (cartId) => api.delete(`/cart/${cartId}`);

// // Cart Items
// export const listCartItems = () => api.get("/cart/items");
// export const addCartItem = (cart_id, product_id, quantity) =>
//   api.post("/cart/items", { cart_id, product_id, quantity });
// export const updateCartItem = (id, quantity) =>
//   api.put(`/cart/items/${id}`, { quantity });
// export const deleteCartItem = (id) => api.delete(`/cart/items/${id}`);
import api from "./axios";

// Cart
export const listCarts = () => api.get("/cart");
export const getCartByUser = (userId) => api.get(`/cart/user/${userId}`);
export const createCart = (userId) => api.post("/cart", { user_id: userId });
export const deleteCart = (cartId) => api.delete(`/cart/${cartId}`);

// Cart Items
export const listCartItems = () => api.get("/cart/items");
export const addCartItem = (cart_id, product_id, quantity) =>
  api.post("/cart/items", { cart_id, product_id, quantity });
export const updateCartItem = (id, quantity) =>
  api.put(`/cart/items/${id}`, { quantity });
export const deleteCartItem = (id) => api.delete(`/cart/items/${id}`);
