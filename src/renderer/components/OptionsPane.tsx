/* eslint-disable react/jsx-props-no-spreading */
import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  activeConversationAtom,
  modelChoiceAtom,
  systemPromptAtom,
  temperatureAtom,
  messagesAtom,
} from '../state';
import { ResizingTextarea } from '../Util';

function SystemPromptInput() {
  const [systemPrompt, setSystemPrompt] = useAtom(systemPromptAtom);
  const [activeConversation] = useAtom(activeConversationAtom);

  useEffect(() => {
    if (systemPrompt != null) {
      localStorage.setItem('systemPrompt', systemPrompt);
    }
  });

  return (
    <ResizingTextarea
      variant="filled"
      placeholder="You are a friendly AI assistant..."
      // eslint-disable-next-line no-undef
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setSystemPrompt(e.target.value)
      }
      value={systemPrompt}
      disabled={activeConversation}
    />
  );
}

function ButtonCluster() {
  const [, setMessages] = useAtom(messagesAtom);
  const [, setActiveConversation] = useAtom(activeConversationAtom);
  return (
    <Box>
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
    </Box>
  );
}

function TemperatureSlider() {
  const [, setTemperature] = useAtom(temperatureAtom);
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

function ModelSelector() {
  const [model, setModel] = useAtom(modelChoiceAtom);

  const models = window.config.getModels();

  return (
    <Select
      value={models[model]}
      onChange={(event) => {
        setModel(models.indexOf(event.target.value));
      }}
    >
      {models.map((modelName) => {
        return (
          <option value={modelName} key={models.indexOf(modelName)}>
            {modelName}
          </option>
        );
      })}
    </Select>
  );
}

// eslint-disable-next-line import/prefer-default-export
export function OptionsPane() {
  return (
    <Flex position="sticky">
      <Box w="80%">
        <SystemPromptInput />
      </Box>
      <Box w="20%">
        <Box>
          <ButtonCluster />
        </Box>
        <ModelSelector />
      </Box>
    </Flex>
  );
}
