import OpenAI from 'openai';
import { Message, Completion } from '../../common/completions';
import {
  CompletionError,
  CompletionOptions,
  CompletionProvider,
  ModelExtension,
  ModelInfo,
  ProviderInfo,
  ProviderTrait,
  UserInputState,
} from './providers';
import { ZodError, ZodType, ZodTypeDef, z } from 'zod';

export type OpenAIProviderOptions = {
  friendly_name: string;
  identifier: string;
  base_url: string;
  models: ModelInfo[];
};

const openAIConfigSchema = z.object({
  api_key: z.string().startsWith('sk-'),
});

type ConfigSchema = {
  api_key: string;
};

export class OpenAIProvider extends CompletionProvider<ConfigSchema> {
  openai: OpenAI;

  options: OpenAIProviderOptions;

  apiKeyBad: boolean;

  constructor(compatible?: OpenAIProviderOptions) {
    super();

    this.apiKeyBad = false;

    if (compatible !== null) {
      this.options = compatible!;
    } else {
      this.options = {
        friendly_name: 'OpenAI',
        identifier: 'openai',
        base_url: 'https://api.openai.com/v1/',
        models: [
          {
            friendly_name: 'GPT-3.5 Turbo',
            identifier: 'gpt-3.5-turbo',
            price_input: 0.5,
            price_output: 1.5,
            extensions: [ModelExtension.FunctionCalling],
          },
          {
            friendly_name: 'GPT-4 Turbo (Preview)',
            identifier: 'gpt-4-turbo-preview',
            price_input: 10.0,
            price_output: 30.0,
            extensions: [ModelExtension.FunctionCalling],
          },
        ],
      };
    }

    this.openai = new OpenAI({
      baseURL: this.options.base_url,
      apiKey: '',
    });
  }

  getProviderInfo(): ProviderInfo {
    return {
      friendly_name: this.options.friendly_name,
      identifier: this.options.identifier,
      traits: [ProviderTrait.APIKey, ProviderTrait.StreamedCompletions],
    };
  }

  getCompletion(
    model: string,
    history: Message[],
    options: CompletionOptions,
  ): Promise<CompletionError | Completion> {
    const historyModified = [] as Message[];
    if (options.systemPrompt !== undefined) {
      historyModified.push({
        role: 'system',
        content: options.systemPrompt,
      } as Message);
    }

    history.forEach((message) => {
      // Filter out pseudo-messages the model can't cope with like error messages, etc.
      if (['system', 'assistant', 'user'].includes(message.role)) {
        historyModified.push({
          role: message.role,
          content: message.content,
        });
      }
    });

    return this.openai.chat.completions
      .create({
        // @ts-ignore
        messages: historyModified,
        model,
        temperature: options.temperature,
      })
      .then((oaiCompletion) => {
        const oaiMsg = oaiCompletion.choices[0].message;
        const msg = { role: oaiMsg.role, content: oaiMsg.content } as Message;

        return {
          messages: [msg],
          tokens_input: oaiCompletion.usage!.prompt_tokens,
          tokens_output: oaiCompletion.usage!.completion_tokens,
        } as Completion;
      });
  }

  availableModels(): ModelInfo[] {
    return this.options.models;
  }

  configSchema(): ZodType<any, ZodTypeDef, any> {
    return openAIConfigSchema;
  }

  acceptConfig(config: ConfigSchema): void {
    let parsed;
    try {
      parsed = this.configSchema().parse(config);
    } catch (e) {
      return;
    }

    this.openai.apiKey = (parsed as ConfigSchema).api_key;
  }

  userInputState(): UserInputState {
    if (this.apiKeyBad) {
      return {
        message:
          'API key invalid/unset. Please specify it in the configuration pane.',
        disabled: true,
      };
    }
    return super.userInputState();
  }
}
