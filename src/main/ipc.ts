import { ipcMain, ipcRenderer } from 'electron';
import OpenAI from 'openai';
import { config } from './config';
import { Message } from '../renderer/state';

const openai = new OpenAI({
  apiKey: '',
});

export type Completion = {
  messages: Message[];
  tokens_prompt: number;
  tokens_response: number;
};

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
        config.openai_timeout,
      )
        // eslint-disable-next-line promise/always-return
        .then((completion: OpenAI.Chat.ChatCompletion) => {
          console.log(completion.choices[0].message);
          event.reply('getCompletion', {
            messages: [completion.choices[0].message],
            tokens_prompt: completion.usage!.prompt_tokens,
            tokens_response: completion.usage!.completion_tokens,
          } as Completion);
        })
        .catch((e) => {
          let message = `[OpenAI Error: ${e}]`;
          if (e === undefined) {
            message = '[OpenAI Response Took Too Long]';
          }
          event.reply('getCompletion', {
            role: 'assistant',
            content: message,
          });
        });
    },
  );
}

export function updateConfig() {
  const sanitizedConfig = { ...config };
  sanitizedConfig.api_key = '';
  return sanitizedConfig;
}

ipcMain.on('updateConfig', (event) => {
  event.reply('updateConfig', updateConfig());
});

// eslint-disable-next-line import/prefer-default-export
export function updateAPIKey(key: string) {
  openai.apiKey = key;
}
