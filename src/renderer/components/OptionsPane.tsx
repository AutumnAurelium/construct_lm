/* eslint-disable react/jsx-props-no-spreading */
import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Message } from './MessagesPane';
import { ResizingTextarea } from '../Util';

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
      // eslint-disable-next-line no-undef
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

// eslint-disable-next-line import/prefer-default-export
export function OptionsPane(attr: {
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
