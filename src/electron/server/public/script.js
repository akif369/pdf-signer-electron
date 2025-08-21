const socket = io();
const frame = document.getElementById("pdf-frame");

function loadPdf() {
  frame.src = "/pdf#" + Date.now(); // force refresh
}

// Load PDF on connect
loadPdf();

// Refresh whenever new PDF is uploaded
socket.on("pdf-updated", () => {
  console.log("🔄 PDF updated, reloading...");
  loadPdf();
});
