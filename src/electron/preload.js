// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("adbAPI", {
  // Ask main process to check once (not needed if using polling, but good to keep)
  checkDevice: () => ipcRenderer.invoke("check-device-status"),

  // Subscribe to full status (device + chrome)
  onStatusChange: (callback) => {
    ipcRenderer.on("device-status", (_, status) => callback(status));
  },

  // Subscribe only to Chrome running state
  onChromeChange: (callback) => {
    ipcRenderer.on("chrome-status", (_, running) => callback(running));
  },
});
