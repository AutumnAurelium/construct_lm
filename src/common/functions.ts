export type ParameterDef = {
  type: 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean';
  description: string;
  enum: string[] | null;
  properties: [string: ParameterDef] | null;
  required: string[] | null;
};

export type FunctionDef = {
  name: string;
  description: string;
  parameters: ParameterDef;
};
