import fs from 'fs';

// eslint-disable-next-line import/prefer-default-export, import/no-mutable-exports
export let config = {
  providers: {
    openai: { api_key: '' },
  },
};

export function loadConfig() {
  config = JSON.parse(fs.readFileSync('./config.json').toString());
}

export function saveConfig() {
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
}
