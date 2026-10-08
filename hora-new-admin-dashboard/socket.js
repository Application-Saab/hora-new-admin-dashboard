import { io } from "socket.io-client";
import { MEDIA_PROCESSING_BASE_URL } from "./src/utils/apiconstant"


let socket = null;

export const connectSocket = (userId) => {
    if (!userId) return null;
    if (socket) return socket;

    socket = io(MEDIA_PROCESSING_BASE_URL, {
        transports: ["websocket", "polling"],
        query: { userId },
        autoConnect: true,
    });

    socket.on("connect", () => console.log("✅ CONNECTED:", socket.id));
    socket.on("disconnect", (reason) => console.log("❌ DISCONNECTED:", reason));
    socket.on("connect_error", (err) => console.log("❌ CONNECT ERROR:", err.message));

    return socket;
};

export const getSocket = () => {
    if (typeof window === "undefined") return null;
    if (socket) return socket;
    const userId = localStorage.getItem("supplierID");
    return userId ? connectSocket(userId) : null;
};

if (typeof window !== "undefined") getSocket();

export default socket;