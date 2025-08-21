// main.js
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { exec } from "child_process";
import { checkAdbDevice } from "./adb/adbUtils.js";
import { startServer } from "./server/server.js";

let mainWindow;
let deviceWasConnected = false;
let chromeRunning = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "src/electron/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  // Start Socket.io server + tracking
  startServer((isRunning) => {
    chromeRunning = isRunning;
    if (mainWindow) {
      mainWindow.webContents.send("chrome-status", chromeRunning);
    }
  });
});

// Poll every 2s for device
setInterval(async () => {
  const deviceOnline = await checkAdbDevice();

  if (mainWindow) {
    mainWindow.webContents.send("device-status", {
      deviceOnline,
      chromeRunning,
    });
  }

  if (deviceOnline && !deviceWasConnected) {
    console.log("Device detected! Forwarding port + opening Chrome...");
    exec("adb reverse tcp:3000 tcp:3000");
    exec(
      `adb shell am start -a android.intent.action.VIEW -d "http://localhost:3000" com.android.chrome`
    );
  }

  deviceWasConnected = deviceOnline;
}, 2000);
