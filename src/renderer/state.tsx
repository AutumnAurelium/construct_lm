import { atom } from 'jotai';

export type Message = {
  role: string;
  content: string;
};

export const messagesAtom = atom([] as Message[]);
export const activeConversationAtom = atom(false);
export const systemPromptAtom = atom(
  window.localStorage.getItem('systemPrompt')!,
);
export const temperatureAtom = atom(1.0);
