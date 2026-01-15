import { io, Socket } from "socket.io-client";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const socket: Socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket"], // force websocket
});
