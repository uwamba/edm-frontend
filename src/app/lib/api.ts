// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Your Laravel API base URL
  withCredentials: true, // IMPORTANT for Sanctum
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
