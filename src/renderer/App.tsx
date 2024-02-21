/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import {
  ChakraProvider,
  defineStyle,
  defineStyleConfig,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MessagesPane, Message } from './components/MessagesPane';
import { MessageInput } from './components/MessageInput';
import { OptionsPane } from './components/OptionsPane';

function Home() {
  const [sysPrompt, setSysPrompt] = useState(() => {
    return localStorage.getItem('systemPrompt');
  });
  const [messages, setMessages] = useState<Message[]>(() => []);
  const [activeConversation, setActiveConversation] = useState<boolean>(
    () => false,
  );
  const [temperature, setTemperature] = useState<number>(() => 0.5);

  function addMessages(toAdd: Message[]) {
    const newMsgs = [...messages, ...toAdd];
    setMessages(newMsgs);
    return newMsgs;
  }

  return (
    <ChakraProvider>
      <OptionsPane
        sysPrompt={sysPrompt!}
        setSysPrompt={setSysPrompt}
        setMessages={setMessages}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        temperature={temperature}
        setTemperature={(temp) => {
          setTemperature(temp);
        }}
      />

      <MessagesPane
        messages={messages}
        setMessages={setMessages}
        setActiveConversation={setActiveConversation}
      />

      <MessageInput
        messages={messages}
        addMessages={addMessages}
        systemPrompt={sysPrompt!}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        temperature={temperature}
      />
    </ChakraProvider>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

const outline = defineStyle({
  background: 'orange.500',
  color: 'white',
  fontFamily: 'serif',
  fontWeight: 'normal',

  // let's also provide dark mode alternatives
  _dark: {
    background: 'orange.300',
    color: 'orange.800',
  },
});

export const textareaTheme = defineStyleConfig({
  variants: { outline },
});
