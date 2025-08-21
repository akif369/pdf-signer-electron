import { useState, useEffect } from "react";
import StatusBar from "./components/StatusBar";

function App() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Initial check
    window.adbAPI.checkDevice().then(setIsOnline);

    // Listen for updates
    window.adbAPI.onStatusChange((status) => {
      setIsOnline(status);
    });
  }, []);

  return (
    <div className="app">
      <StatusBar isOnline={isOnline} />
      {/* You can use isOnline anywhere else in your app */}
      <div className="content">
        {isOnline ? "Device connected ✅" : "No device connected ❌"}
      </div>
    </div>
  );
}

export default App;
