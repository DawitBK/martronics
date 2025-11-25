// // src/stores/authStore.js
// import { create } from "zustand";
// import api from "../api/axios";

// const useAuthStore = create((set, get) => ({
//   user: null,
//   accessToken: null,
//   refreshToken: null,
//   loading: false,
//   error: null,

//   login: async (email, password) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await api.post("/user/login", { email, password });
//       const { user, accessToken, refreshToken } = res.data;

//       set({ user, accessToken, refreshToken, loading: false });
//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//     } catch (err) {
//       set({
//         error: err.response?.data?.message || err.message,
//         loading: false,
//       });
//     }
//   },

//   register: async (firstName, lastName, email, password) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await api.post("/user", {
//         firstName,
//         lastName,
//         email,
//         password,
//       });
//       // auto-login after signup
//       await get().login(email, password);
//     } catch (err) {
//       set({
//         error: err.response?.data?.message || err.message,
//         loading: false,
//       });
//     }
//   },

//   logout: () => {
//     set({ user: null, accessToken: null, refreshToken: null });
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//   },

//   refreshToken: async () => {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken) return;

//     try {
//       const res = await api.post(
//         "/user/refresh",
//         {},
//         {
//           headers: { Authorization: `Bearer ${refreshToken}` },
//         }
//       );
//       const { access_token, refresh_token } = res.data;

//       set({ accessToken: access_token, refreshToken: refresh_token });
//       localStorage.setItem("accessToken", access_token);
//       localStorage.setItem("refreshToken", refresh_token);
//     } catch (err) {
//       get().logout();
//     }
//   },

//   loadFromStorage: () => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     const accessToken = localStorage.getItem("accessToken");
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (user && accessToken && refreshToken) {
//       set({ user, accessToken, refreshToken });
//     }
//   },
// }));

// export default useAuthStore;
// // import { create } from "zustand";
// // import api from "../api/axios";

// // const useAuthStore = create((set) => ({
// //   user: null,
// //   accessToken: null,
// //   refreshToken: null,

// //   login: async (email, password) => {
// //     try {
// //       const { data } = await api.post("/auth/login", { email, password });
// //       const { user, accessToken, refreshToken } = data;

// //       // Persist in localStorage
// //       localStorage.setItem("user", JSON.stringify(user));
// //       localStorage.setItem("accessToken", accessToken);
// //       localStorage.setItem("refreshToken", refreshToken);

// //       set({ user, accessToken, refreshToken });
// //     } catch (err) {
// //       console.error("Login error", err);
// //     }
// //   },

// //   logout: () => {
// //     localStorage.removeItem("user");
// //     localStorage.removeItem("accessToken");
// //     localStorage.removeItem("refreshToken");
// //     set({ user: null, accessToken: null, refreshToken: null });
// //   },

// //   loadFromStorage: () => {
// //     const user = JSON.parse(localStorage.getItem("user"));
// //     const accessToken = localStorage.getItem("accessToken");
// //     const refreshToken = localStorage.getItem("refreshToken");
// //     if (user && accessToken && refreshToken) {
// //       set({ user, accessToken, refreshToken });
// //     }
// //   },
// // }));

// // export default useAuthStore;
// src/stores/authStore.js
import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,

  // ---------------- LOGIN ----------------
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/user/login", { email, password });
      const { user, accessToken, refreshToken } = res.data;

      // Save to Zustand
      set({ user, accessToken, refreshToken, loading: false });

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // ---------------- REGISTER ----------------
  register: async (firstName, lastName, email, password) => {
    set({ loading: true, error: null });
    try {
      await api.post("/user", {
        firstName,
        lastName,
        email,
        password,
      });

      // Auto login
      await get().login(email, password);
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  // ---------------- LOGOUT ----------------
  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // ---------------- REFRESH TOKEN ----------------
  refreshTokenRequest: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const res = await api.post(
        "/user/refresh",
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      const { access_token, refresh_token } = res.data;

      set({
        accessToken: access_token,
        refreshToken: refresh_token,
      });

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
    } catch {
      get().logout();
    }
  },

  // ---------------- LOAD FROM LOCAL STORAGE ----------------
  loadFromStorage: () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (user && accessToken && refreshToken) {
      set({ user, accessToken, refreshToken });
    }
  },

  // Helper
  isAuthenticated: () => !!get().accessToken,
}));

export default useAuthStore;
