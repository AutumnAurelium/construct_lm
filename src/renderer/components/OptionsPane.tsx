/* eslint-disable react/jsx-props-no-spreading */
import { DeleteIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import {
  activeConversationAtom,
  modelChoiceAtom,
  systemPromptAtom,
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
    <Flex>
      <Box w="100%">
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

      <Box>
        <Menu direction="ltr">
          <MenuButton as={Button} colorScheme="blue">
            <HamburgerIcon />
          </MenuButton>
          <MenuList>
            <Link to="/tools">
              <MenuItem>Tools</MenuItem>
            </Link>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
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
    <HStack gap={0}>
      <Box w="80%" m={0}>
        <SystemPromptInput />
      </Box>
      <Box w="20%" p={0}>
        <ButtonCluster />
        <ModelSelector />
      </Box>
    </HStack>
  );
}
