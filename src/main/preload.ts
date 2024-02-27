// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Config } from './config';

export type Channels = 'getCompletion';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

let config: Config;

ipcRenderer.send('updateConfig');

ipcRenderer.on('updateConfig', (event, newCfg: Config) => {
  console.log('got new config');
  config = newCfg;
});

const configHandler = {
  getModels(): string[] {
    return config.models;
  },
  getPromptPrices(): number[] {
    return config.prompt_prices;
  },
  getResponsePrices(): number[] {
    return config.response_prices;
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('config', configHandler);

export type ElectronHandler = typeof electronHandler;
export type ConfigHandler = typeof configHandler;
