// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

let currentPdfBuffer = null;

export function startServer(onClientChange) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  const PORT = 3000;

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

  // Serve default page
  app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>PDF Preview</title>
        <script src="/socket.io/socket.io.js"></script>
        <!-- Load PDF.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"></script>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 0; background: #f0f0f0; }
          #viewer { width: 100%; height: 100vh; overflow: auto; text-align: center; }
          canvas { display: block; margin: 0 auto 20px; border: 1px solid #ccc; }
          #no-pdf { text-align: center; padding: 20px; color: gray; }
        </style>
      </head>
      <body>
        <div id="viewer"><div id="no-pdf">No PDF loaded yet.</div></div>

        <script>
          const socket = io();

          function loadPdf() {
            fetch("/pdf")
              .then(res => {
                if (!res.ok) throw new Error("No PDF yet");
                return res.arrayBuffer();
              })
              .then(buffer => {
                document.getElementById("viewer").innerHTML = ""; // clear old
                const loadingTask = pdfjsLib.getDocument({ data: buffer });
                loadingTask.promise.then(pdf => {
                  for (let i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then(page => {
                      const viewport = page.getViewport({ scale: 1.5 });
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      canvas.width = viewport.width;
                      canvas.height = viewport.height;
                      document.getElementById("viewer").appendChild(canvas);
                      page.render({ canvasContext: ctx, viewport });
                    });
                  }
                });
              })
              .catch(err => {
                document.getElementById("viewer").innerHTML = "<div id='no-pdf'>No PDF loaded yet.</div>";
              });
          }

          // Load once on startup
          loadPdf();

          // Reload when updated
          socket.on("pdf-updated", () => {
            console.log("📌 PDF updated, reloading...");
            loadPdf();
          });
        </script>
      </body>
      </html>
    `);
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
