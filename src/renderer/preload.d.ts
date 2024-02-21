import { ElectronHandler, ConfigHandler } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    config: ConfigHandler;
  }
}

export {};
