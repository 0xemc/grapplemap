export type Transition = {
  tags?: string[];
  title: string;
  from: string;
  fromTag?: PositionModifier;
  to: string;
  toTag?: PositionModifier;
  steps: string[];
};

export type PositionModifier = "t" | "b" | "a" | "d"

export type Position = {
  title: string,
  modifier?: PositionModifier,
  tags?: string[]
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