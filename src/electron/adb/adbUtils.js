import { exec } from "child_process";

/**
 * Check if an ADB device is connected
 * @returns {Promise<boolean>}
 */
export function checkAdbDevice() {
  return new Promise((resolve) => {
    exec("adb devices", (error, stdout) => {
      if (error) {
        resolve(false);
        return;
      }
      const lines = stdout.trim().split("\n");
      // Device is connected if there's a second line containing "device"
      const deviceConnected = lines.length > 1 && lines[1].includes("device");
      resolve(deviceConnected);
    });
  });
}
