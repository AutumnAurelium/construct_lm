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

  // handles raw message viewing
  if (showRaw) {
    return (
      <SyntaxHighlighter language="markdown" PreTag="div" style={materialLight}>
        {message.content}
      </SyntaxHighlighter>
    );
  }

  return (
    <Markdown
      remarkPlugins={[remarkMath]} // parses the math
      rehypePlugins={[rehypeKatex]} // renders the math
      components={{
        // eslint-disable-next-line react/no-unstable-nested-components
        code(props) {
          // eslint-disable-next-line react/prop-types
          const { children, className, ...rest } = props;
          const langMatch = /language-(\w+)/.exec(className || ''); // matches the language of the codeblock
          return langMatch ? (
            // @ts-ignore
            <SyntaxHighlighter
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...rest}
              PreTag="div"
              language={langMatch[1]}
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
          // Make all links try to open a new window. This causes it to open in the user's browser instead of changing the Electron URL.
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
      {
        message.content.replaceAll('\\[ ', '$$ ').replaceAll(' \\]', ' $$') // OpenAI's fine tuning likes to use this syntax for math. This might be a bit of a hack, but it makes it more reliable.
      }
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
        bg={
          message.role === 'assistant' ? 'gray.100' : 'white' // responsible for the alternating-stripes pattern that improves readability
        }
        p={1}
      >
        <VStack>
          <span>
            {(() => {
              // Put role icons here.
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
        {/* Message context menu - maybe separate into new component? */}
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
