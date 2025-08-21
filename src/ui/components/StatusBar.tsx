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

  const handleClick = () => {
    if (status.deviceOnline && !status.chromeRunning) {
      // 👉 Replace with your actual served file URL
      window.adbAPI.launchChrome();
    }
  };

  return (
    <div style={{cursor:`${(status.deviceOnline && !status.chromeRunning)?"pointer":"default"}`}} title={`${(status.deviceOnline && !status.chromeRunning)?"click here to open Chrome":"chrome is running"}`} className={`status-bar ${statusClass}`} onClick={handleClick}>
      <span className="pulse"></span> {text}
    </div>
  );
}

export default StatusBar;
