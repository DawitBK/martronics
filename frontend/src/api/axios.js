// src/api/axios.js
import axios from "axios";
import useAuthStore from "../stores/authStore";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // adjust to your backend URL
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor to refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore.getState();

    const originalRequest = error.config;

    // Prevent infinite loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      authStore.refreshToken
    ) {
      originalRequest._retry = true;
      try {
        // Call your backend refresh endpoint
        const res = await axios.post(
          "http://localhost:3000/api/user/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${authStore.refreshToken}`,
            },
          }
        );

        const { access_token, refresh_token } = res.data;

        // Update tokens in store and localStorage
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        authStore.setState({
          accessToken: access_token,
          refreshToken: refresh_token,
        });

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (err) {
        authStore.logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
