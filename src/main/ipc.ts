import { ipcMain } from 'electron';
import OpenAI from 'openai';
import { config, saveConfig } from './config';
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
  // completion call
  ipcMain.on(
    'getCompletion',
    (event, messages: Message[], temperature: number, model: string) => {
      console.log(messages);
      // prevents the program from hanging on requests forever. might be better to do this in the renderer.
      timeout(
        openai.chat.completions.create({
          // @ts-ignore
          messages,
          temperature,
          model,
        }),
        config.openai_timeout, // in milliseconds
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

          // TODO: add role specifically for these errors
          event.reply('getCompletion', {
            messages: [
              {
                role: 'assistant',
                content: message,
              },
            ],
            tokens_prompt: 0,
            tokens_response: 0,
          } as Completion);
        });
    },
  );

  // returns up-to-date config when render thread asks
  ipcMain.on('updateConfig', (event) => {
    event.reply('updateConfig', config);
  });
}

// Sets OpenAI API key
export function updateAPIKey(key: string) {
  openai.apiKey = key;
}

// handles setAPIKey event
ipcMain.on('setAPIKey', (event, apiKey) => {
  config.api_key = apiKey;
  updateAPIKey(apiKey);
  saveConfig();
});
