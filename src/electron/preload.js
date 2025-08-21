const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("adbAPI", {
  checkDevice: () => ipcRenderer.invoke("check-device-status"),

  onStatusChange: (callback) => {
    ipcRenderer.on("device-status", (_, status) => callback(status));
  },

  onChromeChange: (callback) => {
    ipcRenderer.on("chrome-status", (_, running) => callback(running));
  },

  // 👉 New: launch Chrome with served file
  launchChrome: () => ipcRenderer.invoke("launch-chrome"),
});
