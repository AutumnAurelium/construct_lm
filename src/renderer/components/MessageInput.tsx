import { useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Message } from './MessagesPane';
import { ResizingTextarea } from '../Util';

const React = require('react');

// eslint-disable-next-line import/prefer-default-export
export function MessageInput(attr: {
  messages: Message[];
  addMessages: (msgs: Message[]) => Message[];
  systemPrompt: string;
  activeConversation: boolean;
  setActiveConversation: (active: boolean) => void;
  temperature: number;
}) {
  let { messages } = attr;
  const {
    addMessages,
    systemPrompt,
    activeConversation,
    setActiveConversation,
    temperature,
  } = attr;
  const [isWaiting, setIsWaiting] = useState(() => false);

  useEffect(() => {
    // @ts-ignore
    return window.electron.ipcRenderer.on(
      'getCompletion',
      // @ts-ignore
      (completion: Message) => {
        addMessages([completion]);
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
            messages = addMessages([
              { role: 'system', content: systemPrompt },
              msg,
            ]);
          } else {
            messages = addMessages([msg]);
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
