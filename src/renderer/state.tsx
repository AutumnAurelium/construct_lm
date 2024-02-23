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

export const messagesAtom = atom([] as Message[]);
export const activeConversationAtom = atom(false);
export const systemPromptAtom = atom(
  window.localStorage.getItem('systemPrompt')!,
);
export const temperatureAtom = atom(1.0);
export const modelChoiceAtom = atom(0);
export const modelUsageAtom = atom(
  window.config.getModels().map(() => {
    return {
      tokens_prompt: 0,
      tokens_response: 0,
    };
  }) as UsageInfo,
);
