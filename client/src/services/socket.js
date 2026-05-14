import { io } from "socket.io-client";

// ✅ Create ONLY ONE socket instance
const socket = io("http://localhost:5000", {
  autoConnect: true,
});

export default socket;