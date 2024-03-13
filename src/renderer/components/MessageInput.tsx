import { useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import {
  activeConversationAtom,
  modelChoiceAtom,
  systemPromptAtom,
  temperatureAtom,
  messagesAtom,
  providerChoiceAtom,
} from '../state';
import { ResizingTextarea } from '../Util';
import { Message } from '../../common/completions';
import { Registry } from '../completions/registry';

function PriceInfo() {
  const total = 999999;

  return (
    <Box>
      <p>API Cost: {total > 0.001 ? `$${total.toFixed(3)}` : '<$0.001'}</p>
    </Box>
  );
}

export function MessageInput() {
  // eslint-disable-next-line prefer-const
  let [messages, setMessages] = useAtom(messagesAtom);
  const [activeConversation, setActiveConversation] = useAtom(
    activeConversationAtom,
  );
  const [systemPrompt] = useAtom(systemPromptAtom);
  const [temperature] = useAtom(temperatureAtom);
  const [model] = useAtom(modelChoiceAtom);
  const [provider] = useAtom(providerChoiceAtom);
  const [isWaiting, setIsWaiting] = useState(() => false);

  const activeProvider = Registry.getInstance().getEnabledProviders()[provider];
  if (!activeProvider) {
    console.log('tried to access invalid provider');
  }

  // eslint-disable-next-line no-undef
  function keyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (!e.getModifierState('Shift')) {
        e.preventDefault();

        if (!isWaiting && activeProvider) {
          // @ts-ignore
          const msg: Message = { role: 'user', content: e.target.value };
          // @ts-ignore
          e.target.value = '';

          // Setting `messages` here doesn't actually change the value in the atom.
          // It's important that we copy the messages array rather than mutating it.

          // Adds the system prompt as the first message if we're just starting a new conversation.
          if (!activeConversation && systemPrompt !== null) {
            messages = [{ role: 'system', content: systemPrompt }];
          }
          // Don't send empty messages. Just ask the model for another reply with no additional messages. Good for re-rolling responses.
          if (msg.content !== '') {
            messages = [...messages, msg];
          }
          setMessages(messages);
          setActiveConversation(true);

          console.log(msg);

          setIsWaiting(true);

          // eslint-disable-next-line promise/catch-or-return
          activeProvider
            .getCompletion(
              activeProvider.availableModels()[model].identifier!,
              messages,
              {
                temperature,
                systemPrompt,
                extensions: [],
              },
            )
            .then((result) => {
              console.log(result);
              if ('source' in result) {
                console.log(result.source);
                return undefined;
              }
              setMessages([...messages, ...result.messages]);
              setIsWaiting(false);
              return undefined;
            });
        }
      }
    }
  }

  return (
    <VStack>
      <Box w="100%" mb={2}>
        <ResizingTextarea
          disabled={activeProvider?.userInputState().disabled} // disable the message box when the API key isn't set
          placeholder={activeProvider?.userInputState().message}
          onKeyDown={keyDown}
        />
      </Box>
      <Box mb={2}>
        <PriceInfo />
      </Box>
    </VStack>
  );
}
