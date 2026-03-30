// lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000/api",
  withCredentials: true, // ✅ Rely on HTTP-only cookies for authentication
});

// No need to manually set Authorization header - cookies are sent automatically
export default api;
