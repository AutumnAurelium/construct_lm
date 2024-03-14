import OpenAI from 'openai';
import { ZodError, ZodType, ZodTypeDef, z } from 'zod';
import { Message, ConstructCompletion } from '../../common/completions';
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

export type OpenAIProviderOptions = {
  friendly_name: string;
  identifier: string;
  base_url: string;
  models: ModelInfo[];
};

const openAIConfigSchema = z.object({
  api_key: z.string(),
});

type ConfigSchema = {
  api_key: string;
};

export class OpenAIProvider extends CompletionProvider<ConfigSchema> {
  openai: OpenAI;

  options: OpenAIProviderOptions;

  apiKeyBad: boolean;

  error: ZodError[] | undefined;

  constructor(compatible?: OpenAIProviderOptions) {
    super();

    this.apiKeyBad = false;

    if (compatible !== undefined) {
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
      dangerouslyAllowBrowser: true,
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
  ): Promise<CompletionError | ConstructCompletion> {
    const historyModified = [] as Message[];
    if (options.systemPrompt) {
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
      .catch((e) => {
        return {
          messages: [
            {
              content: `An error occurred. Please try again later.\n${e}`,
              role: 'assistant',
            },
          ],
          tokens_input: 0,
          tokens_output: 0,
        } as ConstructCompletion;
      })
      .then((result) => {
        if ('messages' in result) {
          // preprocessors are hell, why can't i use instanceof here...
          return result as ConstructCompletion;
        }
        const oaiCompletion = result as OpenAI.Chat.Completions.ChatCompletion;
        const oaiMsg = oaiCompletion.choices[0].message;
        const msg = { role: oaiMsg.role, content: oaiMsg.content } as Message;

        const tokensInput = oaiCompletion.usage!.prompt_tokens;
        const tokensOutput = oaiCompletion.usage!.completion_tokens;
        const modelInfo = this.getModelByID(model)!;

        return {
          messages: [msg],
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          price:
            (tokensInput / 1000000) * modelInfo.price_input +
            (tokensOutput / 1000000) * modelInfo.price_output,
        } as ConstructCompletion;
      });
  }

  availableModels(): ModelInfo[] {
    return this.options.models;
  }

  configSchema(): ZodType<any, ZodTypeDef, any> {
    return openAIConfigSchema;
  }

  consumeConfig(config: ConfigSchema): void {
    let parsed;
    try {
      parsed = this.configSchema().parse(config);
    } catch (e) {
      if (e instanceof ZodError) {
        this.setZodErrors(e.errors);
      }
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
