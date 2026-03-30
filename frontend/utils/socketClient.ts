import { io, Socket } from "socket.io-client";
import api from "@/lib/api";

let socket: Socket | null = null;
let isRefreshing = false;

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    console.log("⚠️ Socket already connected:", socket.id);
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000", {
    auth: { token },
    withCredentials: true,
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connect error:", err.message);
  });

  socket.on("token_expired", async () => {
    if (isRefreshing) return;
    isRefreshing = true;

    console.warn("⚠️ Token expired, refreshing...");
    try {
      const res = await api.post("/admin/refresh-token", {}, { withCredentials: true });
      const newToken = res.data.token;

      // ✅ Optionally store new token in localStorage or context
      socket?.off(); // remove all listeners before reconnecting
      if (socket) {
        socket.disconnect();
      }
      socket = initSocket(newToken);
    } catch (err) {
      console.error("❌ Refresh failed, redirecting to login", err);
      window.location.href = "/landing";
    } finally {
      isRefreshing = false;
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;
