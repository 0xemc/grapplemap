export type Transition = {
  tags: string[];
  title: string;
  from: string;
  fromTag?: PositionTag;
  to: string;
  toTag?: PositionTag;
  steps: string[];
};

export type PositionTag = "t" | "b" | "a" | "d"

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