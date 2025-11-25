import { create } from "zustand";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productService";

const useProductStore = create((set) => ({
  products: [],
  product: null,
  loading: false,
  error: null,

  getProducts: async () => {
    set({ loading: true });
    try {
      const res = await fetchProducts();
      set({ products: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  getProduct: async (id) => {
    set({ loading: true });
    try {
      const res = await fetchProductById(id);
      set({ product: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  addProduct: async (data) => {
    try {
      const res = await createProduct(data);
      set((state) => ({ products: [...state.products, res.data] }));
      return res.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  editProduct: async (id, data) => {
    try {
      const res = await updateProduct(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? res.data : p)),
      }));
      return res.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  removeProduct: async (id) => {
    try {
      await deleteProduct(id);
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },
}));

export default useProductStore;
