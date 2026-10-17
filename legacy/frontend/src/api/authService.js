import api from "./axios";

const authService = {
    login: (credentials) => api.post("/user/login", credentials),
    register: (userData) => api.post("/user", userData),
    getCurrentUser: () => api.get("/user/me"),
};

export default authService;
