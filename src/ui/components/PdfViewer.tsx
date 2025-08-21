import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// ✅ Use local worker (important for Electron)
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

type DeviceStatus = {
  deviceOnline: boolean;
  chromeRunning: boolean;
};

function PdfViewer() {
  const [fileData, setFileData] = useState<string | ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DeviceStatus>({
    deviceOnline: false,
    chromeRunning: false,
  });

  useEffect(() => {
    window.adbAPI.onStatusChange((data: DeviceStatus) => {
      setStatus(data);
    });

    window.adbAPI.onChromeChange((running: boolean) => {
      setStatus((prev) => ({ ...prev, chromeRunning: running }));
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a valid PDF file");
      return;
    }

    setLoading(true);
    setError(null);
    setFileData(null);
    setNumPages(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setFileData(arrayBuffer);

      // 👉 Upload to server for Android preview
      const response = await fetch("http://localhost:3000/upload-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: arrayBuffer,
      });
      console.log(response);
      handleClick();
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Failed to read PDF file");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (status.deviceOnline && !status.chromeRunning) {
      // 👉 Replace with your actual served file URL
      window.adbAPI.launchChrome();
    }
  };

  // Cancel button → clear everything
const handleCancel = async () => {
  setFileData(null);
  setNumPages(null);
  setError(null);
  setLoading(false);

  try {
    await fetch("http://localhost:3000/clear-pdf", { method: "DELETE" });
    console.log("🗑️ Cleared PDF from server");
  } catch (err) {
    console.error("Failed to clear PDF from server:", err);
  }
};

  useEffect(() => {
    return () => {
      if (typeof fileData === "string" && fileData.startsWith("blob:")) {
        URL.revokeObjectURL(fileData);
      }
    };
  }, [fileData]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDocumentLoadError = (error: any) => {
    console.error("PDF load error:", error);
    setError(`Failed to load PDF: ${error.message || "Unknown error"}`);
    setNumPages(null);
  };

  return (
    <div className="pdf-viewer" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        {fileData && (
          <button
            onClick={handleCancel}
            style={{
              padding: "6px 12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {loading && <div>Loading PDF...</div>}

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {fileData && !loading && (
        <div
          className="pdf-preview"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <Document
            file={fileData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
          >
            {numPages &&
              Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={600}
                />
              ))}
          </Document>
        </div>
      )}
    </div>
  );
}

export default PdfViewer;
