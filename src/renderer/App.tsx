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
import Home from './Home';
import ToolsConfiguration from './Tools';

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolsConfiguration />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
