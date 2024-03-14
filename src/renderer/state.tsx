import { atom } from 'jotai';
import { Message } from '../common/completions';
import { Registry } from './completions/registry';

export type ModelUsageInfo = {
  tokens_prompt: number;
  tokens_response: number;
};

export function restoreChoicesFromLocalStorage(): [number, number] {
  const providerChoice = window.localStorage.getItem('lastProviderChoice');

  console.log(providerChoice);

  if (providerChoice) {
    const providerChoiceObj =
      Registry.getInstance().getProvider(providerChoice);
    if (providerChoiceObj !== undefined) {
      const modelChoice = window.localStorage.getItem('lastModelChoice');

      if (modelChoice) {
        const modelChoiceObj = providerChoiceObj.getModelByID(modelChoice);

        if (modelChoiceObj) {
          return [
            Registry.getInstance()
              .getEnabledProviders()
              .indexOf(providerChoiceObj),
            providerChoiceObj.availableModels().indexOf(modelChoiceObj),
          ];
        }
      }
    }
  }

  // First run, page needs to be reloaded when a config is passed in.
  return [-1, -1];
}

export type UsageInfo = ModelUsageInfo[];

export const messagesAtom = atom([] as Message[]); // message list
export const activeConversationAtom = atom(false); // whether there are visible messages
export const systemPromptAtom = atom(
  // system prompt to inject
  window.localStorage.getItem('systemPrompt')!, // set from localStorage
);
export const temperatureAtom = atom(1.0); // currently never set anywhere, may re-add in a submenu later
const [modelChoice, providerChoice] = restoreChoicesFromLocalStorage();
export const modelChoiceAtom = atom(-1); // This is the way it is for a reason. See the useEffect in App.tsx
export const providerChoiceAtom = atom(-1);
export const apiUsageAtom = atom(0);
