import assert from 'assert';
import fs from 'fs';

// eslint-disable-next-line import/prefer-default-export, import/no-mutable-exports
export let config = {
  models: ['gpt-3.5-turbo', 'gpt-4-0125-preview'],
  standard_model: 0,
  upgrade_model: 1,
  prompt_prices: [0.0005, 0.01],
  response_prices: [0.0015, 0.03],
  files_dir: 'files/',
  save_dir: 'saved/',
  api_key: '',
  openai_timeout: 100000,
};

export type Config = typeof config;

// This sucks and I wish I could validate against a schema.
export function validateConfig() {
  try {
    config.models.forEach((model) => {
      assert(model.startsWith('gpt'));
    });
  } catch {
    return 'Model list';
  }

  try {
    assert(
      config.standard_model >= 0 &&
        config.standard_model < config.models.length,
    );
  } catch {
    return 'Standard model';
  }

  try {
    assert(
      config.upgrade_model >= 0 && config.upgrade_model < config.models.length,
    );
  } catch {
    return 'Upgrade model';
  }

  try {
    assert(fs.existsSync(config.files_dir));
  } catch {
    return 'Files directory';
  }

  try {
    assert(fs.existsSync(config.save_dir));
  } catch {
    return 'Saves directory';
  }

  try {
    assert(config.api_key.startsWith('sk-'));
  } catch {
    return 'API key';
  }

  try {
    assert(config.openai_timeout > 100);
  } catch {
    return 'OpenAI timeout';
  }

  try {
    assert(config.prompt_prices.length === config.models.length);
    assert(config.response_prices.length === config.models.length);
  } catch {
    return 'Pricing info';
  }

  return undefined;
}

export function loadConfig() {
  config = JSON.parse(fs.readFileSync('./config.json').toString());
}
