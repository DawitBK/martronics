
import { create } from "zustand";
import api from "../api/axios.js";

const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  // Fetch all orders for the logged-in user
  fetchOrders: async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return; // Only proceed if logged in

    set({ loading: true, error: null });
    try {
      const res = await api.get("/order");

      // Filter orders to only those belonging to the logged-in user
      const userOrders = res.data.filter((order) => order.user_id === user.id);

      // Attach user data to each order (optional, can skip if already included)
      const ordersWithUser = await Promise.all(
        userOrders.map(async (order) => {
          order.user = user; // current logged-in user
          return order;
        })
      );

      set({ orders: ordersWithUser, loading: false });
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      set({ error: "Failed to load orders", loading: false });
    }
  },

  // Create new order
  createOrder: async (data) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return null;

    try {
      const res = await api.post("/order", {
        ...data,
        user_id: user.id, // attach current user
      });

      const order = res.data;
      order.user = user;

      set((state) => ({ orders: [...state.orders, order] }));
      return order;
    } catch (err) {
      console.error("Create Order Error:", err.response?.data || err);
      return null;
    }
  },

  // Fetch single order by ID (only if it belongs to logged-in user)
  getOrder: async (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;

    set({ loading: true });
    try {
      const res = await api.get(`/order/${id}`);
      const order = res.data;

      if (order.user_id !== user.id) {
        set({ currentOrder: null, loading: false, error: "Unauthorized" });
        return;
      }

      order.user = user;
      set({ currentOrder: order, loading: false });
    } catch (err) {
      console.error("Fetch Order Error:", err);
      set({ error: "Failed to fetch order", loading: false });
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
}));

export default useOrderStore;
