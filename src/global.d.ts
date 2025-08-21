export {};


declare global {
  interface Window {
    adbAPI: {
      checkDevice: () => Promise<boolean>;
      onStatusChange: (callback: (status: { deviceOnline: boolean; chromeRunning: boolean }) => void) => void;
      onChromeChange: (callback: (running: boolean) => void) => void;
      launchChrome: () => Promise<void>;

    };
  }
}