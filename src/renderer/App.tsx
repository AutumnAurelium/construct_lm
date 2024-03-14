/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import { ChakraProvider } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import Home from './Home';
import ToolsConfiguration from './Tools';
import Settings from './Settings';
import {
  modelChoiceAtom,
  providerChoiceAtom,
  restoreChoicesFromLocalStorage,
} from './state';
import { Registry } from './completions/registry';

export default function App() {
  const [, setProviderChoice] = useAtom(providerChoiceAtom);
  const [, setModelChoice] = useAtom(modelChoiceAtom);
  useEffect(() => {
    if (!Registry.getInstance().isInitialized()) {
      window.electron.ipcRenderer.sendMessage('updateConfig');
    }

    window.electron.ipcRenderer.on('updateConfig', (newCfg: any) => {
      console.log('got new config');
      Registry.getInstance().consumeConfig(newCfg);

      const [modelChoice, providerChoice] = restoreChoicesFromLocalStorage();

      console.log(modelChoice);

      if (modelChoice === -1 || providerChoice === -1) {
        setModelChoice(0);
        setProviderChoice(0);
      } else {
        setModelChoice(modelChoice);
        setProviderChoice(providerChoice);
      }
    });
  });

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tools" element={<ToolsConfiguration />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
