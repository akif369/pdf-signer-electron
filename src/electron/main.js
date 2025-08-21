import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { checkAdbDevice } from "./adb/adbUtils.js"; // Import helper

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "src/electron/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
}

app.whenReady().then(createWindow);

// IPC event for checking device status
ipcMain.handle("check-device-status", async () => {
  return await checkAdbDevice();
});

// Poll device status every 2s and push updates
setInterval(async () => {
  const status = await checkAdbDevice();
  if (mainWindow) {
    mainWindow.webContents.send("device-status", status);
  }
}, 2000);
