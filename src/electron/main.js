// main.js
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { exec } from "child_process";
import { checkAdbDevice } from "./adb/adbUtils.js";
import { startServer } from "./server/server.js";

let mainWindow;
let deviceWasConnected = false;
let chromeRunning = false;
const  url = "http://localhost:3000" ;

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

ipcMain.handle("launch-chrome", async (_) => {
   
  return new Promise((resolve, reject) => {
    exec(
      `adb shell am start -a android.intent.action.VIEW -d "${url}" com.android.chrome`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Failed to launch Chrome:", stderr);
          reject(stderr);
          return;
        }
        resolve(stdout);
      }
    );
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
      `adb shell am start -a android.intent.action.VIEW -d ${url} com.android.chrome`
    );
  }

  deviceWasConnected = deviceOnline;
}, 2000);
