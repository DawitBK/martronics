// // import { create } from "zustand";
// // import {
// //   fetchCategories,
// //   createCategory,
// //   updateCategory,
// //   deleteCategory,
// // } from "../api/categoryService";

// // const useCategoryStore = create((set) => ({
// //   categories: [],
// //   loading: false,
// //   error: null,

// //   getCategories: async () => {
// //     set({ loading: true });
// //     try {
// //       const res = await fetchCategories();
// //       set({ categories: res.data, loading: false });
// //     } catch (err) {
// //       set({ error: err.message, loading: false });
// //     }
// //   },

// //   addCategory: async (data) => {
// //     try {
// //       const res = await createCategory(data);
// //       set((state) => ({ categories: [...state.categories, res.data] }));
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   },

// //   editCategory: async (id, data) => {
// //     try {
// //       const res = await updateCategory(id, data);
// //       set((state) => ({
// //         categories: state.categories.map((cat) =>
// //           cat.id === id ? res.data : cat
// //         ),
// //       }));
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   },

// //   removeCategory: async (id) => {
// //     try {
// //       await deleteCategory(id);
// //       set((state) => ({
// //         categories: state.categories.filter((cat) => cat.id !== id),
// //       }));
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   },
// // }));

// // export default useCategoryStore;
// import { create } from "zustand";
// import {
//   listCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/categoryService";

// const useCategoryStore = create((set) => ({
//   categories: [],
//   loading: false,
//   error: null,

//   getCategories: async () => {
//     set({ loading: true });
//     try {
//       const res = await listCategories();
//       set({ categories: res.data, loading: false });
//     } catch (err) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   addCategory: async (data) => {
//     try {
//       const res = await createCategory(data);
//       set((state) => ({ categories: [...state.categories, res.data] }));
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   editCategory: async (id, data) => {
//     try {
//       const res = await updateCategory(id, data);
//       set((state) => ({
//         categories: state.categories.map((cat) =>
//           cat.id === id ? res.data : cat
//         ),
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   removeCategory: async (id) => {
//     try {
//       await deleteCategory(id);
//       set((state) => ({
//         categories: state.categories.filter((cat) => cat.id !== id),
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   },
// }));

// export default useCategoryStore;

// import { create } from "zustand";
// import {
//   listCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/categoryService";

// const useCategoryStore = create((set) => ({
//   categories: [],
//   loading: false,
//   error: null,

//   getCategories: async () => {
//     set({ loading: true });
//     try {
//       const res = await listCategories();
//       set({ categories: res.data, loading: false });
//     } catch (err) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   addCategory: async (data) => {
//     try {
//       const res = await createCategory(data);
//       set((state) => ({ categories: [...state.categories, res.data] }));
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   editCategory: async (id, data) => {
//     try {
//       const res = await updateCategory(id, data);
//       set((state) => ({
//         categories: state.categories.map((cat) =>
//           cat.id === id ? res.data : cat
//         ),
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   },

//   removeCategory: async (id) => {
//     try {
//       await deleteCategory(id);
//       set((state) => ({
//         categories: state.categories.filter((cat) => cat.id !== id),
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   },
// }));

// export default useCategoryStore;
import { create } from "zustand";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryService.js";
import {
  listSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../api/subCategoryService.js";

const useCategoryStore = create((set) => ({
  categories: [],
  subCategories: [],
  loading: false,
  error: null,

  // --- Categories ---
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await listCategories();
      set({ categories: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addCategory: async (data) => {
    try {
      const res = await createCategory(data);
      set((state) => ({ categories: [...state.categories, res.data] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create category:", err);
      return null;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const res = await updateCategory(id, data);
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? res.data : cat
        ),
      }));
      return res.data;
    } catch (err) {
      console.error("Failed to update category:", err);
      return null;
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  },

  // --- Subcategories ---
  fetchSubCategories: async () => {
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
      set((state) => ({ subCategories: [...state.subCategories, res.data] }));
      return res.data;
    } catch (err) {
      console.error("Failed to create subcategory:", err);
      return null;
    }
  },

  updateSubCategory: async (id, data) => {
    try {
      const res = await updateSubCategory(id, data);
      set((state) => ({
        subCategories: state.subCategories.map((sub) =>
          sub.id === id ? res.data : sub
        ),
      }));
      return res.data;
    } catch (err) {
      console.error("Failed to update subcategory:", err);
      return null;
    }
  },

  deleteSubCategory: async (id) => {
    try {
      await deleteSubCategory(id);
      set((state) => ({
        subCategories: state.subCategories.filter((sub) => sub.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
    }
  },
}));

export default useCategoryStore;
