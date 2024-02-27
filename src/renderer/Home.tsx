import { Box, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
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
