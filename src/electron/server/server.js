// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentPdfBuffer = null;

export function startServer(onClientChange) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  const PORT = 3000;

  // serve static files (index.html, css, etc.)
  app.use(express.static(path.join(__dirname, "public")));
    
  // Upload new PDF
  app.post(
    "/upload-pdf",
    express.raw({ type: "application/pdf", limit: "50mb" }),
    (req, res) => {
      if (!req.body || !req.body.length) {
        return res.status(400).send("No PDF uploaded");
      }
      currentPdfBuffer = req.body;
      io.emit("pdf-updated"); // notify all clients
      console.log("📄 PDF uploaded and served");
      res.send("OK");
    }
  );

  // Serve current PDF
  app.get("/pdf", (req, res) => {
    if (!currentPdfBuffer) {
      return res.status(404).send("No PDF loaded");
    }
    res.contentType("application/pdf");
    res.send(currentPdfBuffer);
  });

  io.on("connection", (socket) => {
    console.log("✅ Chrome page connected");
    onClientChange(true);

    socket.on("disconnect", () => {
      console.log("❌ Chrome page disconnected");
      onClientChange(false);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}
