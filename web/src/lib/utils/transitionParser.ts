import * as ohm from 'ohm-js';
import transitionRecipe from '@lang/recipes/transition.json';
import { transition } from '@lang/operations';

const grammar = ohm.makeRecipe(transitionRecipe);

export async function matchTransition(text: string) {
  return grammar.match(text);
}

export type ParseOk<T> = { ok: true; value: T };
export type ParseErr = {
  ok: false;
  error: { message: string; shortMessage?: string; offset?: number; line?: number; column?: number };
};
export type ParseResult<T> = ParseOk<T> | ParseErr;

export async function parseTransitions(text: string): Promise<ParseResult<string[]>> {
  const result = grammar.match(text);
  if (result.failed()) {
    const interval = result.getInterval();
    const lc = interval?.getLineAndColumn?.();
    return {
      ok: false,
      error: {
        message: result.message ?? 'Parse failed',
        shortMessage: result.shortMessage,
        offset: interval?.startIdx,
        line: lc?.lineNum,
        column: lc?.colNum
      }
    };
  }

  const semantics = grammar.createSemantics().addOperation('transitions', transition)

  const transitions = semantics(result).transitions() as string[];
  return { ok: true, value: transitions };
}

export async function traceTransition(text: string): Promise<string> {
  return String(grammar.trace(text));
}

export async function debugParse(text: string) {
  const match = await matchTransition(text);
  if (match.failed()) {
    const interval = match.getInterval();
    const lc = interval?.getLineAndColumn?.();

    console.error('[parse] failed at', { offset: interval?.startIdx, line: lc?.lineNum, column: lc?.colNum });

    console.error(match.message);
    return { ok: false } as ParseErr;
  }
  const parsed = await parseTransitions(text);

  console.log('[parse] ok:', parsed.ok ? parsed.value : parsed);
  return parsed;
}


