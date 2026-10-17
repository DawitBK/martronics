import { create } from "zustand";
import {
  listSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../api/subCategoryService";

const useSubCategoryStore = create((set) => ({
  subCategories: [],
  loading: false,
  error: null,

  getSubCategories: async () => {
    set({ loading: true });
    try {
      const res = await listSubCategories();
      set({ subCategories: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addSubCategory: async (data) => {
    try {
      const res = await createSubCategory(data);
      set((state) => ({
        subCategories: [...state.subCategories, res.data],
      }));
    } catch (err) {
      console.error(err);
    }
  },

  editSubCategory: async (id, data) => {
    try {
      const res = await updateSubCategory(id, data);
      set((state) => ({
        subCategories: state.subCategories.map((sub) =>
          sub.id === id ? res.data : sub
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  removeSubCategory: async (id) => {
    try {
      await deleteSubCategory(id);
      set((state) => ({
        subCategories: state.subCategories.filter((sub) => sub.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));

export default useSubCategoryStore;
