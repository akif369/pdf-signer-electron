// main.js (Electron main process)
import { app, BrowserWindow, ipcMain } from "electron";
import { exec } from "child_process";
import path from "path";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "src/electron/preload.js"), // preload bridge
      nodeIntegration:true,
      contextIsolation:true,
      webSecurity:false,
      allowRunningInsecureContent:true,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
}

app.whenReady().then(createWindow);

// Function to check adb device connection
function checkAdbDevice() {
  return new Promise((resolve) => {
    exec("adb devices", (error, stdout) => {
      if (error) {
        resolve(false);
        return;
      }
      // If there's a device listed (other than the header line), it's online
      const lines = stdout.trim().split("\n");
      const deviceConnected = lines.length > 1 && lines[1].includes("device");
      resolve(deviceConnected);
    });
  });
}

// IPC event to check device status
ipcMain.handle("check-device-status", async () => {
  return await checkAdbDevice();
});

// Optional: poll device status every 2s and push update
setInterval(async () => {
  const status = await checkAdbDevice();
  if (mainWindow) {
    mainWindow.webContents.send("device-status", status);
  }
}, 2000);
