import axios from "axios";

const apiUser = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  withCredentials: true, // ✅ Cookie-based
});

export default apiUser;
