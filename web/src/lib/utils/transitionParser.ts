import ohm from 'ohm-js';
import { createTransitionsSemantics } from '@lang/semantics';
import grammarSrc from '@lang/transition.ohm?raw';

const grammar = ohm.grammar(grammarSrc);

export async function matchTransition(text: string) {
  return grammar.match(text);
}

export type ParseOk<T> = { ok: true; value: T };
export type ParseErr = {
  ok: false;
  error: { message: string; shortMessage?: string; offset?: number; line?: number; column?: number };
};
export type ParseResult<T> = ParseOk<T> | ParseErr;

export async function parseTransitions(text: string): Promise<ParseResult<any[]>> {
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

  const semantics = createTransitionsSemantics(grammar);

  const transitions = semantics(result).transitions();
  return { ok: true, value: transitions };
}

export async function traceTransition(text: string): Promise<string> {
  const t: any = grammar.trace(text);
  return typeof t?.toString === 'function' ? t.toString() : String(t);
}

export async function debugParse(text: string) {
  const match = await matchTransition(text);
  if (match.failed()) {
    const interval = match.getInterval();
    const lc = interval?.getLineAndColumn?.();
    // eslint-disable-next-line no-console
    console.error('[parse] failed at', { offset: interval?.startIdx, line: lc?.lineNum, column: lc?.colNum });
    // eslint-disable-next-line no-console
    console.error(match.message);
    return { ok: false } as ParseErr;
  }
  const parsed = await parseTransitions(text);
  // eslint-disable-next-line no-console
  console.log('[parse] ok:', parsed.ok ? parsed.value : parsed);
  return parsed;
}


