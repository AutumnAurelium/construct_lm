import { useEffect, useState } from 'react';
import { Box, Flex, Select } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { Message, activeConversationAtom, modelChoiceAtom, systemPromptAtom, temperatureAtom } from '../state';
import { ResizingTextarea } from '../Util';
import { messagesAtom } from '../state';

const React = require('react');

export function MessageInput() {
  let [messages, setMessages] = useAtom(messagesAtom);
  let [activeConversation, setActiveConversation] = useAtom(activeConversationAtom);
  let [systemPrompt] = useAtom(systemPromptAtom);
  let [temperature] = useAtom(temperatureAtom);
  const [isWaiting, setIsWaiting] = useState(() => false);

  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'getCompletion',
      // @ts-ignore
      (completion: Message) => {
        setMessages([...messages, completion]);
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
          );
        }
      }
    }
  }

  return (
    <Flex>
      <Box w="100%">
        <ResizingTextarea
          placeholder={isWaiting ? 'Thinking...' : 'Type here...'}
          onKeyDown={keyDown}
        />
      </Box>
    </Flex>
  );
}
