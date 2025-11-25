// src/api/orderService.js
import api from "./axios";

// Fetch all orders
export const fetchOrders = () => api.get("/order");

// Fetch a single order by ID
export const fetchOrderById = (id) => api.get(`/order/${id}`);

// Create a new order
export const createOrder = (data) => {
  // Ensure user_id is present; attach from localStorage if missing
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = {
      ...(data || {}),
      user_id: (data && data.user_id) || user?.id,
    };
    return api.post("/order", payload);
  } catch (err) {
    // fallback: send data as-is
    return api.post("/order", data);
  }
};

// Update an existing order
export const updateOrder = (id, data) => api.put(`/order/${id}`, data);

// Delete an order
export const deleteOrder = (id) => api.delete(`/order/${id}`);
