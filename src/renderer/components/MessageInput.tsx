import { useEffect, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import {
  Message,
  activeConversationAtom,
  modelChoiceAtom,
  modelUsageAtom,
  systemPromptAtom,
  temperatureAtom,
  messagesAtom,
} from '../state';
import { ResizingTextarea } from '../Util';
import { Completion } from '../../main/ipc';

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

  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'getCompletion',
      // @ts-ignore
      (completion: Completion) => {
        console.log(completion);
        setMessages([...messages, ...completion.messages]);

        priceInfo[model].tokens_prompt += completion.tokens_prompt;
        priceInfo[model].tokens_response += completion.tokens_response;
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
          if (!activeConversation && systemPrompt !== null) {
            messages = [{ role: 'system', content: systemPrompt }];
          }
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
