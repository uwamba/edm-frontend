// utils/axiosInstance.ts

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Laravel API URL (adjust if necessary)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token to the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Attach token to every request
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
