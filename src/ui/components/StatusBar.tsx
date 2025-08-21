// StatusBar.tsx
import { useEffect, useState } from "react";

type DeviceStatus = {
  deviceOnline: boolean;
  chromeRunning: boolean;
};

function StatusBar() {
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

  let text = "Offline";
  let statusClass = "offline";

  if (status.deviceOnline && status.chromeRunning) {
    text = "Online + Running";
    statusClass = "running";
  } else if (status.deviceOnline) {
    text = "Online";
    statusClass = "online";
  }

  return (
    <div className={`status-bar ${statusClass}`}>
      <span className="pulse"></span> {text}
    </div>
  );
}

export default StatusBar;
