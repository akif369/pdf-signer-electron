// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

export function startServer(onClientChange) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  const PORT = 3000;

  // Serve Hello World page
  app.get("/", (req, res) => {
    res.send(`
      <h1>Hello World from Electron!</h1>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        socket.on("connect", () => {
          console.log("Connected to server via Socket.io");
        });
        socket.on("disconnect", () => {
          console.log("Disconnected from server");
        });
      </script>
    `);
  });

  io.on("connection", (socket) => {
    console.log("Chrome page connected");
    onClientChange(true);

    socket.on("disconnect", () => {
      console.log("Chrome page disconnected");
      onClientChange(false);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
