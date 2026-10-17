import { create } from "zustand";
import api from "../api/axios";
import useAuthStore from "./authStore";

const useCartStore = create((set, get) => ({
  cartItems: [],
  loading: false,
  error: null,

  fetchCart: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/cart/user/${user.id}`);
      set({ cartItems: data.items || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    let user = get().user;
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        user = JSON.parse(storedUser);
        useAuthStore.setState({ user });
      }
    }

    if (!user) {
      window.location.href = "/login";
      return;
    }

    set({ loading: true, error: null });

    try {
      // 🔹 1. Ensure the user has a cart
      const cartRes = await api.get(`/cart/user/${user.id}`);
      const cartId = cartRes.data.id;

      // 🔹 2. Add item
      const { data } = await api.post("/cart/items", {
        cart_id: cartId,
        product_id: productId,
        quantity,
      });

      // 🔹 3. Fetch updated item with product details
      const fullItem = await api.get(`/cart/items`);
      const added = fullItem.data.find((i) => i.id === data.id);

      set((state) => ({
        cartItems: [...state.cartItems, added],
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  updateCartItem: async (id, quantity) => {
    try {
      await api.put(`/cart/items/${id}`, { quantity });

      set((state) => ({
        cartItems: state.cartItems.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      }));
    } catch (err) {
      console.log(err);
    }
  },

  removeFromCart: async (id) => {
    try {
      await api.delete(`/cart/items/${id}`);
      set((state) => ({
        cartItems: state.cartItems.filter((i) => i.id !== id),
      }));
    } catch (err) {
      console.log(err);
    }
  },

  // 🔹 "Buy Now" one item
  buySingleItem: async (cartItem) => {
    const user = useAuthStore.getState().user;

    await api.post("/order", {
      user_id: user.id,
      items: [
        {
          product_id: cartItem.product.id,
          quantity: cartItem.quantity,
        },
      ],
    });

    try {
      // remove the purchased cart item from server
      await api.delete(`/cart/items/${cartItem.id}`);
    } catch (err) {
      console.error("Failed to remove cart item after order:", err);
    }

    set({ cartItems: [] });
    window.location.href = "/order"; // redirect
  },

  // 🔹 "Buy All" items
  buyAllItems: async () => {
    const user = useAuthStore.getState().user;
    const items = useCartStore.getState().cartItems;

    await api.post("/order", {
      user_id: user.id,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    });
    try {
      // delete all cart items on server
      await Promise.all(items.map((i) => api.delete(`/cart/items/${i.id}`)));
    } catch (err) {
      console.error("Failed to clear cart items after order:", err);
    }

    set({ cartItems: [] });
    window.location.href = "/order";
  },

  clearCart: async () => {
    const items = get().cartItems;
    if (!items || items.length === 0) return;

    try {
      await Promise.all(items.map((i) => api.delete(`/cart/items/${i.id}`)));
      set({ cartItems: [] });
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  },
}));

export default useCartStore;
