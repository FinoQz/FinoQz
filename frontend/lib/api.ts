// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });

// api.interceptors.response.use(
//   res => res,
//   async err => {
//     if (err.response?.status === 401 && err.response.data?.message === "Token expired") {
//       try {
//         const refreshRes = await axios.post("http://localhost:5000/api/auth/refresh", {}, { withCredentials: true });
//         const newToken = refreshRes.data.token;
//         localStorage.setItem("adminToken", newToken);

//         err.config.headers.Authorization = `Bearer ${newToken}`;
//         return api(err.config); // retry original request
//       } catch (refreshErr) {
//         console.error("Refresh failed:", refreshErr);
//         // Optionally redirect to login
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // ✅ send cookies
});

// Response interceptor
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && err.response.data?.message?.toLowerCase().includes("expired")) {
      try {
        // ✅ call refresh endpoint
        const refreshRes = await axios.post(
          "http://localhost:5000/api/admin/refresh-token",
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.token;

        // ⚠️ optional: only if backend expects Authorization header
        if (newToken) {
          err.config.headers.Authorization = `Bearer ${newToken}`;
        }

        // mark request as retry to avoid infinite loop
        err.config.__isRetryRequest = true;

        return api(err.config); // retry original request
      } catch (refreshErr) {
        console.error("Refresh failed:", refreshErr);
        // ✅ redirect to login
        window.location.href = "/landing/signin";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
