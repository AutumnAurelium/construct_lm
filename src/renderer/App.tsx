/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import {
  Box,
  Button,
  ChakraProvider,
  defineStyle,
  defineStyleConfig,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, Icon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { FaRobot, FaUser } from 'react-icons/fa';
import { ResizingTextarea } from './Util';

type Message = {
  role: string;
  content: string;
};

function SystemPromptInput(attr: {
  sysPrompt: string;
  setSysPrompt: (prompt: string) => void;
  activeConversation: boolean;
}) {
  const { sysPrompt, setSysPrompt, activeConversation } = attr;

  useEffect(() => {
    if (sysPrompt != null) {
      localStorage.setItem('systemPrompt', sysPrompt);
    }
  });

  return (
    <ResizingTextarea
      variant="filled"
      placeholder="You are a friendly AI assistant..."
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setSysPrompt(e.target.value)
      }
      value={sysPrompt}
      disabled={activeConversation}
    />
  );
}

function ButtonCluster(attr: {
  setMessages: (messages: Message[]) => void;
  systemPrompt: string;
  setActiveConversation: (active: boolean) => void;
}) {
  const { setMessages, setActiveConversation } = attr;
  return (
    <div className="form-group col-sm-2 m-0 pl-0">
      <Button
        colorScheme="red"
        w="100%"
        onClick={() => {
          setActiveConversation(false);
          setMessages([]);
        }}
      >
        <DeleteIcon />
        Reset
      </Button>
    </div>
  );
}

function TemperatureSlider(attr: {
  temperature: number;
  setTemperature: (temp: number) => void;
}) {
  const { setTemperature } = attr;
  const labelStyles = {
    mt: '1',
    ml: '-2.5',
    fontSize: 'sm',
  };
  return (
    <Slider
      onChange={(value) => setTemperature(value)}
      min={0.0}
      max={2.0}
      step={0.1}
    >
      <SliderMark value={0.0} {...labelStyles}>
        0.0
      </SliderMark>
      <SliderMark value={1.0} {...labelStyles}>
        1.0
      </SliderMark>
      <SliderMark value={2.0} {...labelStyles}>
        2.0
      </SliderMark>

      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        label="Temperature"
        textAlign="center"
        bg="blue.500"
        color="white"
        mt="-10"
        ml="-5"
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
}

function OptionsPane(attr: {
  sysPrompt: string;
  setSysPrompt: (prompt: string) => void;
  setMessages: (messages: Message[]) => void;
  activeConversation: boolean;
  setActiveConversation: (active: boolean) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
}) {
  const {
    sysPrompt,
    setSysPrompt,
    setMessages,
    activeConversation,
    setActiveConversation,
    temperature,
    setTemperature,
  } = attr;
  return (
    <Flex>
      <Box w="80%">
        <SystemPromptInput
          sysPrompt={sysPrompt}
          setSysPrompt={setSysPrompt}
          activeConversation={activeConversation}
        />
      </Box>
      <Box w="20%">
        <Box margin={2}>
          <ButtonCluster
            setMessages={setMessages}
            systemPrompt={sysPrompt}
            setActiveConversation={setActiveConversation}
          />
        </Box>
        <Box margin={3} ml={6} mr={6}>
          <TemperatureSlider
            temperature={temperature}
            setTemperature={setTemperature}
          />
        </Box>
      </Box>
    </Flex>
  );
}

function MessagesPane(attr: { messages: Message[] }) {
  const { messages } = attr;
  return (
    <div id="messages">
      {messages.map((message, index) => {
        if (message.role !== 'system') {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index}>
              {(() => {
                if (message.role === 'user') {
                  return <Icon as={FaUser} display="inline" />;
                }
                if (message.role === 'assistant') {
                  return <Icon as={FaRobot} display="inline" />;
                }
              })()}
              <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: marked.parse(message.content) as string,
                }}
              />
            </div>
          );
        }
      })}
    </div>
  );
}

function MessageInput(attr: {
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

      <MessagesPane messages={messages} />

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
