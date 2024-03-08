import { z } from 'zod';
import { Completion, Message } from '../../common/completions';

export enum ProviderTrait {
  /** Indicates that this provider requires an API key. */
  APIKey,
  /** Indicates that this provider supports streamed completions. */
  StreamedCompletions,
}

export type ProviderInfo = {
  /** A friendly name for the provider, i.e. 'OpenAI', 'Gemini'. */
  friendly_name: string;
  /** A unique identifier for the provider, i.e. 'openai', 'gemini'. Must be a valid file path. */
  identifier: string;
  /**  */
  /** A list of the traits of this provider. */
  traits: ProviderTrait[];
};

export enum ModelExtension {
  /** Indicates that the model supports function calling. */
  FunctionCalling,
  /** Indicates that the model supports image comprehension. */
  ImageComprehension,
  /** Indicates that the model supports continuing partial responses.
   * Enabling this extension will cause the most recent 'assistant' message to be extended by the model.
   */
  CompletePartial,
}

export type ModelInfo = {
  /** A friendly name for the model, i.e. 'GPT-3.5 Turbo' or 'Gemini 1.5 Pro'. */
  friendly_name: string;
  /** A unique identifier for the model, i.e. 'gpt-3.5-turbo' or 'gemini-1.5-pro'.
   * Should match the provider's internal name for the model, if one exists. */
  identifier: string;
  /** The price for 1 million tokens of input (prompt) data, in US dollars. */
  price_input: number;
  /** The price for 1 million tokens of output (completion) data, in US dollars. */
  price_output: number;
  /** A list of the supported extensions to this model. */
  extensions: ModelExtension[];
};

export type CompletionOptions = {
  /** The system prompt. Dictates some aspects of the model's behavior. */
  systemPrompt: string | undefined;
  /** The temperature used by the model for a completion. */
  temperature: number;
  /** A list of model extensions enabled for this completion. */
  extensions: ModelExtension[];
};

export enum CompletionErrorSource {
  /** An unknown API problem has occurred. This may be a server issue. */
  APIError,
  /** The provider has reported a problem with the provided API key. */
  APIKeyInvalid,
  /** The provider has rate limited a user or developer account. */
  RateLimited,
  /** The provider has enforced a usage limit on the user.
   * This is usually a result of organizational policy or a restricted developer plan.
   */
  UsageLimit,
  /** The user has attempted to use an extension that the model does not support. */
  ExtensionUnavailable,
  /** A message with an invalid role or malformed body has been passed in the provided message history. */
  MalformedMessage,
  /** No other error source adequately describes the problem, or no further information was given. */
  Unknown,
}

export type CompletionError = {
  /** The source of the error. */
  source: CompletionErrorSource;
  /** A message which may contain diagnostic information or user feedback. */
  message: string;
};

export type UserInputState = {
  disabled: boolean;
  message: string;
};

export abstract class CompletionProvider<Config> {
  /**
   * @returns A description of the provider's capabilities and basic information.
   */
  abstract getProviderInfo(): ProviderInfo;

  /**
   * Gets a completion from a provider with a specified model and message history.
   * @param model The identifier of the model to get the completion from.
   * @param history All messages to be considered in this completion, in order.
   * @returns A promise for either the finished Completion or a CompletionError describing the nature of a fault.
   */
  abstract getCompletion(
    model: string,
    history: Message[],
    options: CompletionOptions,
  ): Promise<Completion | CompletionError>;

  /**
   * @return A list of all available models from this provider.
   */
  abstract availableModels(): ModelInfo[];

  /**
   * Finds a model on this provider with a given unique ID.
   * This should really remain consistent unless the provider literally adds/removes a model as the user is working.
   * @param id The identifier to search for.
   * @returns Either the first model in availableModels() with identifier `id`, or undefined if no such model exists.
   */
  getModelByID(id: string): ModelInfo | undefined {
    return this.availableModels().find((model) => model.identifier === id);
  }

  /**
   * @returns The Zod schema that this provider's configuration should conform to.
   * Ensure that `ConfigSchema` conforms to this schema as well..
   */
  abstract configSchema(): z.Schema;

  /**
   * Accepts a new configuration.
   * @param config The configuration to use. Should conform to configSchema.
   */
  abstract acceptConfig(config: Config): void;

  /**
   * Use super() for the default, non-errored behavior.
   * @returns The state that the user input box should be in.
   */
  userInputState(): UserInputState {
    return {
      message: 'Type here...',
      disabled: false,
    };
  }
}
