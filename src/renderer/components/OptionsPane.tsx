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
  providerChoiceAtom,
} from '../state';
import { ResizingTextarea } from '../Util';
import { Registry } from '../completions/registry';

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
            <Link to="/settings">
              <MenuItem>Settings</MenuItem>
            </Link>
            <Link to="/tools">
              <MenuItem>Tools</MenuItem>
            </Link>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}

function ProviderSelector() {
  const [provider, setProvider] = useAtom(providerChoiceAtom);
  const [,setModel] = useAtom(modelChoiceAtom);

  const providers = Registry.getInstance().getEnabledProviders();

  console.log(providers);

  return (
    <Select
      value={providers[provider]?.getProviderInfo().identifier}
      onChange={(event) => {
        setProvider(
          providers.findIndex((sProvider) => {
            return (
              sProvider.getProviderInfo().identifier === event.target.value
            );
          }),
        );
        setModel(0);
      }}
    >
      {providers.map((mProvider) => {
        return (
          <option
            value={mProvider.getProviderInfo().identifier}
            key={providers.indexOf(mProvider)}
          >
            {mProvider.getProviderInfo().friendly_name}
          </option>
        );
      })}
    </Select>
  );
}

function ModelSelector() {
  const [provider] = useAtom(providerChoiceAtom);
  const [model, setModel] = useAtom(modelChoiceAtom);

  let models = Registry.getInstance()
    .getEnabledProviders()
    [provider]?.availableModels();

  if (!models) {
    models = [];
  }

  console.log(models);

  return (
    <Select
      value={models[model]?.identifier}
      onChange={(event) => {
        setModel(
          models.findIndex((sModel) => {
            return sModel.identifier === event.target.value;
          }),
        );
      }}
    >
      {models.map((mModel) => {
        return (
          <option value={mModel.identifier} key={models.indexOf(mModel)}>
            {mModel.friendly_name}
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
      <Box w="60%" m={0}>
        <SystemPromptInput />
      </Box>
      <Box w="40%" p={0}>
        <ButtonCluster />
        <HStack>
          <ProviderSelector />
          <ModelSelector />
        </HStack>
      </Box>
    </HStack>
  );
}
