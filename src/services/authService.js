import apiClient from "./api";

const AUTH_API = "/auth";   // FIXED ❗ No /api

export const authService = {

  // LOGIN
  login: async (credentials) => {
    const response = await apiClient.post(`${AUTH_API}/login`, credentials);

    const token = response.data.token;
    const username = response.data.username;

    if (token) {
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify({ username }));
    }

    return token;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("adminToken");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("adminUser");
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
