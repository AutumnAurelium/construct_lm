/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import {
  Box,
  Button,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { FaUser, FaRobot } from 'react-icons/fa';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  materialDark,
  materialLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { useState } from 'react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Message, activeConversationAtom, messagesAtom } from '../state';
import 'katex/dist/katex.min.css';

function MessageRender(attr: { message: Message; showRaw: boolean }) {
  const { message, showRaw } = attr;

  if (showRaw) {
    return (
      <SyntaxHighlighter language="markdown" PreTag="div" style={materialLight}>
        {message.content}
      </SyntaxHighlighter>
    );
  }

  return (
    <Markdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // eslint-disable-next-line react/no-unstable-nested-components
        code(props) {
          // eslint-disable-next-line react/prop-types
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            // @ts-ignore
            <SyntaxHighlighter
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...rest}
              PreTag="div"
              language={match[1]}
              style={materialDark}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
        // eslint-disable-next-line react/no-unstable-nested-components
        a(props) {
          // eslint-disable-next-line react/prop-types
          const { children, ...rest } = props;
          return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <a {...rest} target="_blank">
              {children}
            </a>
          );
        },
      }}
    >
      {message.content}
    </Markdown>
  );
}

export function MessageBox(attr: { message: Message }) {
  const { message } = attr;
  // eslint-disable-next-line prefer-const
  let [messages, setMessages] = useAtom(messagesAtom);
  const [, setActiveConversation] = useAtom(activeConversationAtom);
  const [showRaw, setShowRaw] = useState(false);

  const index = messages.indexOf(message);

  return (
    <Box>
      <HStack
        align="top"
        bg={message.role === 'assistant' ? 'gray.100' : 'white'}
        p={1}
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
        <Box flex={1} overflowX="auto" p={2}>
          <MessageRender message={message} showRaw={showRaw} />
        </Box>
        <Menu direction="ltr">
          <MenuButton as={Button} bg="transparent">
            <HamburgerIcon />
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={() => {
                if (messages.length === 2) {
                  setActiveConversation(false);
                  setMessages([]);
                } else {
                  setMessages([
                    ...messages.slice(0, index),
                    ...messages.slice(index + 1),
                  ]);
                }
              }}
            >
              Delete
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowRaw(!showRaw);
              }}
            >
              {showRaw ? 'Show Formatted' : 'Show Raw'}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
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
