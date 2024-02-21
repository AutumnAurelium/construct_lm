/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { Box, Button, HStack, Icon, VStack } from '@chakra-ui/react';
import { marked } from 'marked';
import { FaUser, FaRobot, FaTrash } from 'react-icons/fa';

export type Message = {
  role: string;
  content: string;
};

export function MessageBox(attr: {
  message: Message;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  setActiveConversation: (active: boolean) => void;
}) {
  const { message, setMessages, setActiveConversation } = attr;
  let { messages } = attr;

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

export function MessagesPane(attr: {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  setActiveConversation: (active: boolean) => void;
}) {
  const { messages, setMessages, setActiveConversation } = attr;
  return (
    <div id="messages">
      {messages.map((message) => {
        if (message.role !== 'system' && message.content !== '') {
          return (
            <MessageBox
              message={message}
              messages={messages}
              setMessages={setMessages}
              setActiveConversation={setActiveConversation}
            />
          );
        }
      })}
    </div>
  );
}