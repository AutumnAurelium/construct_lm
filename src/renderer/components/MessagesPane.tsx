/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { Box, Button, HStack, Icon, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { marked } from 'marked';
import { FaUser, FaRobot, FaTrash } from 'react-icons/fa';
import { Message, activeConversationAtom, messagesAtom } from '../state';

export function MessageBox(attr: { message: Message }) {
  const { message } = attr;
  // eslint-disable-next-line prefer-const
  let [messages, setMessages] = useAtom(messagesAtom);
  const [, setActiveConversation] = useAtom(activeConversationAtom);

  const index = messages.indexOf(message);

  return (
    <div>
      <HStack
        align="top"
        bg={message.role === 'assistant' ? 'gray.100' : 'white'}
      >
        <VStack>
          <span>
            {(() => {
              if (message.role === 'user') {
                return <Icon as={FaUser} boxSize={4} />;
              }
              if (message.role === 'assistant') {
                return <Icon as={FaRobot} boxSize={4} />;
              }
            })()}
          </span>
        </VStack>
        <Box flex={1}>
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: marked.parse(message.content) as string,
            }}
          />
        </Box>
        {(() => {
          if (index === messages.length - 1) {
            return (
              <Button
                fontSize={12}
                bg="transparent"
                onClick={() => {
                  if (index === 1) {
                    setActiveConversation(false);
                    setMessages([]);
                  } else {
                    messages = [...messages.slice(0, index)];
                    setMessages(messages);
                  }
                }}
                padding={0}
              >
                <Icon as={FaTrash} />
              </Button>
            );
          }
        })()}
      </HStack>
    </div>
  );
}

export function MessagesPane() {
  const [messages] = useAtom(messagesAtom);
  return (
    <div id="messages">
      {messages.map((message, index) => {
        if (message.role !== 'system' && message.content !== '') {
          // eslint-disable-next-line react/no-array-index-key
          return <MessageBox message={message} key={index} />;
        }
      })}
    </div>
  );
}
