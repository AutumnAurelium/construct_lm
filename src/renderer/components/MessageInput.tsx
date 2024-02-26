import { useEffect, useState } from 'react';
import { Box, Code, Flex, Select, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { Message, activeConversationAtom, modelChoiceAtom, modelUsageAtom, systemPromptAtom, temperatureAtom } from '../state';
import { ResizingTextarea } from '../Util';
import { messagesAtom } from '../state';
import { Completion } from '../../main/ipc';

const React = require('react');

function PriceInfo() {
  const [priceInfo, setPriceInfo] = useAtom(modelUsageAtom);

  let response_prices = window.config.getResponsePrices();
  let prompt_prices = window.config.getPromptPrices();

  let total = 0;
  priceInfo.forEach((info, index) => {
    total += response_prices[index]*(info.tokens_response/1000);
    total += prompt_prices[index]*(info.tokens_prompt/1000);
  });

  return (
    <Box>
      <p>API Cost: {(total > 0.001) ? `$${total.toFixed(3)}` : '<$0.001'}</p>
    </Box>
  );
}

export function MessageInput() {
  let [messages, setMessages] = useAtom(messagesAtom);
  let [activeConversation, setActiveConversation] = useAtom(activeConversationAtom);
  let [systemPrompt] = useAtom(systemPromptAtom);
  let [temperature] = useAtom(temperatureAtom);
  let [model, setModel] = useAtom(modelChoiceAtom);
  const [priceInfo, setPriceInfo] = useAtom(modelUsageAtom);
  const [isWaiting, setIsWaiting] = useState(() => false);

  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'getCompletion',
      // @ts-ignore
      (completion: Completion) => {
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

        if (!isWaiting) {
          // @ts-ignore
          const msg: Message = { role: 'user', content: e.target.value };
          // @ts-ignore
          e.target.value = '';
          if (!activeConversation) {
            messages = [
              ...messages,
              { role: 'system', content: systemPrompt },
              msg,
            ];
            setMessages(messages);
          } else {
            messages = [...messages, msg];
            setMessages(messages);
          }
          setActiveConversation(true);

          setIsWaiting(true);
          window.electron.ipcRenderer.sendMessage(
            'getCompletion',
            messages,
            temperature,
            window.config.getModels()[model]
          );
        }
      }
    }
  }

  return (
    <VStack>
      <Box w="100%" mb={2}>
        <ResizingTextarea
          placeholder={isWaiting ? 'Thinking...' : 'Type here...'}
          onKeyDown={keyDown}
        />
      </Box>
      <Box mb={2}>
        <PriceInfo />
      </Box>
    </VStack>
  );
}
