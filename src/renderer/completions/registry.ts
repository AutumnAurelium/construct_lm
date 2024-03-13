import { z } from 'zod';
import { OpenAIProvider } from './openai';
import { CompletionProvider } from './providers';

const topLevelConfigSchema = z.object({
  providers: z.record(z.any()),
});

export class Registry {
  // eslint-disable-next-line no-use-before-define
  private static instance: Registry;

  private providers: CompletionProvider<any>[] = [];

  private enabledProviders: string[] = [];

  private constructor() {
    this.providers = [
      new OpenAIProvider(),
      new OpenAIProvider({
        friendly_name: 'together.ai',
        identifier: 'together',
        base_url: 'https://api.together.xyz/v1',
        models: [
          {
            friendly_name: 'LLaMA-2 Chat (7B)',
            identifier: 'meta-llama/Llama-2-7b-chat-hf',
            price_input: 0.2,
            price_output: 0.2,
            extensions: [],
          },
          {
            friendly_name: 'LLaMA-2 Chat (13B)',
            identifier: 'meta-llama/Llama-2-13b-chat-hf',
            price_input: 0.3,
            price_output: 0.3,
            extensions: [],
          },
          {
            friendly_name: 'LLaMA-2 Chat (70B)',
            identifier: 'meta-llama/Llama-2-70b-chat-hf',
            price_input: 0.9,
            price_output: 0.9,
            extensions: [],
          },
        ],
      }),
      new OpenAIProvider({
        friendly_name: 'OpenRouter',
        identifier: 'openrouter',
        base_url: 'https://openrouter.ai/api/v1',
        models: [
          {
            friendly_name: 'Claude 3 Opus',
            identifier: 'anthropic/claude-3-opus',
            price_input: 15,
            price_output: 70,
            extensions: [],
          },
          {
            friendly_name: 'Claude 3 Opus',
            identifier: 'anthropic/claude-3-sonnet',
            price_input: 15,
            price_output: 70,
            extensions: [],
          },
        ],
      }),
    ];
  }

  public static getInstance(): Registry {
    if (!this.instance) {
      console.log('instantiating registry');
      this.instance = new Registry();
    }
    return this.instance;
  }

  public consumeConfig(config: any) {
    console.log(config);
    const topLevelConfig = topLevelConfigSchema.safeParse(config);
    if (topLevelConfig.success) {
      const { providers } = topLevelConfig.data;
      Object.entries(providers).forEach(([id, pConfig]) => {
        const provider = this.getProviderIgnoreEnabled(id);
        if (provider) {
          provider.consumeConfig(pConfig);
          this.enabledProviders.push(id);
        }
      });
    }
  }

  private getProviderIgnoreEnabled(
    id: string,
  ): CompletionProvider<any> | undefined {
    return this.providers.find(
      (provider) => provider.getProviderInfo().identifier === id,
    );
  }

  public getProvider(id: string): CompletionProvider<any> | undefined {
    if (!this.enabledProviders.includes(id)) {
      return undefined;
    }
    return this.getProviderIgnoreEnabled(id);
  }

  public getEnabledProviders(): CompletionProvider<any>[] {
    return this.enabledProviders.map((id) => this.getProvider(id)!);
  }
}

window.electron.ipcRenderer.sendMessage('updateConfig');

window.electron.ipcRenderer.on('updateConfig', (newCfg: any) => {
  console.log('got new config');
  Registry.getInstance().consumeConfig(newCfg);
});
