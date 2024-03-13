export type Message = {
  role: string;
  content: string;
};

export type ConstructCompletion = {
  messages: Message[];
  tokens_input: number;
  tokens_output: number;
};
