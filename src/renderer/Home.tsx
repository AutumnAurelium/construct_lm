import { Box } from '@chakra-ui/react';
import { MessagesPane } from './components/MessagesPane';
import { MessageInput } from './components/MessageInput';
import { OptionsPane } from './components/OptionsPane';

export default function Home() {
  return (
    <Box m={1}>
      <OptionsPane />

      <MessagesPane />

      <MessageInput />
    </Box>
  );
}
