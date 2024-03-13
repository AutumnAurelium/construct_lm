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
    this.providers = [new OpenAIProvider()];
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
}

window.electron.ipcRenderer.sendMessage('updateConfig');

window.electron.ipcRenderer.on('updateConfig', (newCfg: any) => {
  console.log('got new config');
  Registry.getInstance().consumeConfig(newCfg);
});
