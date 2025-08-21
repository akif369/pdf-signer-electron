// src/electron/utils/adbUtil.js
import {exec} from "child_process"
/**
 * Check if any ADB device is connected
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
function isDeviceConnected() {
  return new Promise((resolve) => {
    exec("adb devices", (error, stdout) => {
      if (error) {
        console.error("ADB check failed:", error);
        resolve(false);
        return;
      }

      // Split output into lines
      const lines = stdout.trim().split("\n");

      // First line is "List of devices attached"
      const devices = lines.slice(1).filter((line) => line.includes("device"));

      resolve(devices.length > 0);
    });
  });
}

module.exports = { isDeviceConnected };
