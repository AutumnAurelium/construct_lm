export type Message = {
  role: string;
  content: string;
};

export type Completion = {
  messages: Message[];
  tokens_input: number;
  tokens_output: number;
};
