// lib/apiAdmin.ts
import axios from 'axios';

const apiAdmin = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000/',
  withCredentials: true, // ✅ Send cookies like adminToken automatically
});

export default apiAdmin;
