// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("adbAPI", {
  checkDevice: () => ipcRenderer.invoke("check-device-status"),
  onStatusChange: (callback) => {
    ipcRenderer.on("device-status", (_, status) => callback(status));
  },
});
