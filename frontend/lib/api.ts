// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000/",
  withCredentials: true, // ✅ Rely on HTTP-only cookies for authentication
});

// No need to manually set Authorization header - cookies are sent automatically
export default api;
