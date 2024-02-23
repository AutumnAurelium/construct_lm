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
import { activeConversationAtom, systemPromptAtom, temperatureAtom } from '../state';
import { ResizingTextarea } from '../Util';
import { useAtom } from 'jotai';
import { messagesAtom } from '../state';

function SystemPromptInput() {
  let [systemPrompt, setSystemPrompt] = useAtom(systemPromptAtom);
  let [activeConversation] = useAtom(activeConversationAtom);

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
  let [,setActiveConversation] = useAtom(activeConversationAtom);
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

function TemperatureSlider() {
  let [,setTemperature] = useAtom(temperatureAtom);
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
export function OptionsPane() {
  return (
    <Flex>
      <Box w="80%">
        <SystemPromptInput/>
      </Box>
      <Box w="20%">
        <Box margin={2}>
          <ButtonCluster/>
        </Box>
        <Box margin={3} ml={6} mr={6}>
          <TemperatureSlider/>
        </Box>
      </Box>
    </Flex>
  );
}
