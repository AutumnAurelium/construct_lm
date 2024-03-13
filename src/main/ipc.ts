import { ipcMain } from 'electron';
import { config } from './config';

export function setupIPC() {
  // returns up-to-date config when render thread asks
  ipcMain.on('updateConfig', (event) => {
    event.reply('updateConfig', config);
  });
}
