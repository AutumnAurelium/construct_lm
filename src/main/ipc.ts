import { ipcMain } from 'electron';
import OpenAI from 'openai';
import { config } from './config';
import { Message } from '../renderer/state';

const openai = new OpenAI({
  apiKey: '',
});

// @ts-ignore
const timeout = (prom, time) => {
  let timer: any;
  return Promise.race([
    prom,
    new Promise((_resolve, reject) => {
      timer = setTimeout(reject, time);
      // eslint-disable-next-line no-promise-executor-return
      return timer;
    }),
  ]).finally(() => clearTimeout(timer));
};

export function setupIPC() {
  ipcMain.on(
    'getCompletion',
    (event, messages: Message[], temperature: number, model: string) => {
      console.log(messages);
      timeout(
        openai.chat.completions.create({
          // @ts-ignore
          messages,
          temperature,
          model,
        }),
        10000,
      )
        // eslint-disable-next-line promise/always-return
        .then((completion) => {
          console.log(completion.choices[0].message);
          event.reply('getCompletion', completion.choices[0].message);
        })
        .catch((e) => {
          event.reply('getCompletion', {
            role: 'assistant',
            content: `[OpenAI Error: ]${e}`,
          });
        });
    },
  );
}

ipcMain.on('updateConfig', (event) => {
  const sanitizedConfig = { ...config };
  sanitizedConfig.api_key = '';
  event.reply('updateConfig', sanitizedConfig);
});

// eslint-disable-next-line import/prefer-default-export
export function updateAPIKey(key: string) {
  openai.apiKey = key;
}
