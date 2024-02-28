import { atom } from 'jotai';

export type Message = {
  role: string;
  content: string;
};

export type ModelUsageInfo = {
  tokens_prompt: number;
  tokens_response: number;
};

export type UsageInfo = ModelUsageInfo[];

export const messagesAtom = atom([] as Message[]); // message list
export const activeConversationAtom = atom(false); // whether there are visible messages
export const systemPromptAtom = atom(  // system prompt to inject
  window.localStorage.getItem('systemPrompt')!, // set from localStorage
);
export const temperatureAtom = atom(1.0); // currently never set anywhere, may re-add in a submenu later
export const modelChoiceAtom = atom(0); // currently selected model - this is an index for the `models` var in config.json
export const modelUsageAtom = atom(  // stores a tally of the token usage per-model this session.
  window.config.getModels().map(() => {
    return {
      tokens_prompt: 0,
      tokens_response: 0,
    };
  }) as UsageInfo,
);
