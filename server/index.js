const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const notificationRoutes = require("./routes/notificationRoutes");
const commentRoutes =require("./routes/commentRoutes");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/notifications", notificationRoutes);
// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Attach socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// 🔥 Socket connection
io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );

  socket.on(
    "joinProject",
    (projectId) => {

      socket.join(projectId);

      console.log(
        `User joined project ${projectId}`
      );
    }
  );

  // 🟢 TASK ROOM
  socket.on(
    "joinTask",
    (taskId) => {

      socket.join(taskId);

      console.log(
        `User joined task ${taskId}`
      );
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// 👉 Make io accessible globally
app.set("io", io);

// 🔁 your routes here...
const PORT = 5000;
server.listen(PORT, () => console.log("Server running on port", PORT));
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/orgRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment",commentRoutes);
app.use("/api/attachment",attachmentRoutes);
app.use("/api/chat",chatRoutes);