import { useEffect, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import {
  activeConversationAtom,
  modelChoiceAtom,
  modelUsageAtom,
  systemPromptAtom,
  temperatureAtom,
  messagesAtom,
} from '../state';
import { ResizingTextarea } from '../Util';
import { Completion, Message } from '../../common/completions';

const React = require('react');

function PriceInfo() {
  const [priceInfo] = useAtom(modelUsageAtom);

  const responsePrices = window.config.getResponsePrices();
  const promptPrices = window.config.getPromptPrices();

  let total = 0;
  priceInfo.forEach((info, index) => {
    total += responsePrices[index] * (info.tokens_response / 1000);
    total += promptPrices[index] * (info.tokens_prompt / 1000);
  });

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
  const [priceInfo, setPriceInfo] = useAtom(modelUsageAtom);
  const [isWaiting, setIsWaiting] = useState(() => false);

  // Have to use side effects here.
  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'getCompletion',
      // @ts-ignore
      (completion: Completion) => {
        console.log(completion);
        setMessages([...messages, ...completion.messages]);

        priceInfo[model].tokens_prompt += completion.tokens_input;
        priceInfo[model].tokens_response += completion.tokens_output;
        setPriceInfo(priceInfo);

        setIsWaiting(false);
      },
    );
  });

  // eslint-disable-next-line no-undef
  function keyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (!e.getModifierState('Shift')) {
        e.preventDefault();

        if (!isWaiting && window.config.getAPIKey() !== '') {
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
          window.electron.ipcRenderer.sendMessage(
            'getCompletion',
            messages,
            temperature,
            window.config.getModels()[model],
          );
        }
      }
    }
  }

  return (
    <VStack>
      <Box w="100%" mb={2}>
        <ResizingTextarea
          disabled={window.config.getAPIKey() === ''} // disable the message box when the API key isn't set
          placeholder={(() => {
            if (isWaiting) {
              return 'Thinking...';
            }
            if (window.config.getAPIKey() === '') {
              return 'Please set your API key.';
            }
            return 'Type your message here.';
          })()}
          onKeyDown={keyDown}
        />
      </Box>
      <Box mb={2}>
        <PriceInfo />
      </Box>
    </VStack>
  );
}
