import { ArrowBackIcon } from '@chakra-ui/icons';
import { Button, HStack, Input, Box } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// TODO: Complete the rest of config.json here.
function APIKeySetting() {
  const [apiKey, setApiKey] = useState(window.config.getAPIKey());

  return (
    <HStack>
      <Input
        placeholder="API Key"
        type="password"
        onChange={(event) => {
          setApiKey(event.target.value!);
        }}
      />
      {/* TOOD: Add some feedback for this */}
      <Button
        onClick={() => {
          window.config.setAPIKey(apiKey);
        }}
      >
        Set
      </Button>
    </HStack>
  );
}

export default function Settings() {
  return (
    <Box>
      <Link to="/">
        <Button leftIcon={<ArrowBackIcon />}>Go Back</Button>
      </Link>
      <APIKeySetting />
    </Box>
  );
}
