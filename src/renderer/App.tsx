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
import { MessagesPane } from './components/MessagesPane';
import { MessageInput } from './components/MessageInput';
import { OptionsPane } from './components/OptionsPane';

function Home() {
  return (
    <ChakraProvider>
      <OptionsPane />

      <MessagesPane/>

      <MessageInput/>
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
