export type Transition = {
  tags: string[];
  title: string;
  from: string;
  fromTag?: string;
  to: string;
  toTag?: string;
  steps: string[];
};

export type Position = {
  title: string
}

export type Token = { from: number; to: number; cls: string };

// Ohm Node types for basic type hints
export type OhmNode = {
  source: { startIdx: number; endIdx: number };
  sourceString: string;
  tokens?: () => Token[];
  transitions?: () => Token[];
  children?: any[];
};