// lib/apiAdmin.ts
import axios from 'axios';

const apiAdmin = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000/',
  withCredentials: true, // ✅ Send cookies like adminToken automatically
});

// ✅ Add interceptor to catch session expiration
apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('finoqz-admin-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
