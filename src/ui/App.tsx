import { useState, useEffect } from "react";
import StatusBar from "./components/StatusBar";
import PdfViewer from "./components/PdfViewer";

function App() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    window.adbAPI.checkDevice().then(setIsOnline);
    window.adbAPI.onStatusChange((status) => setIsOnline(status));
  }, []);

  return (
    <div className="app">
      <StatusBar isOnline={isOnline} />
      <PdfViewer />
    </div>
  );
}

export default App;
