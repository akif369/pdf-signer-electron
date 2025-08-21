export {};

declare global {
  interface Window {
    adbAPI: {
      checkDevice: () => Promise<boolean>;
      onStatusChange: (callback: (status: boolean) => void) => void;
    };
  }
}
