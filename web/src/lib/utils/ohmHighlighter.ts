import type { Extension } from '@codemirror/state';
import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import ohm from 'ohm-js';
import { createTransitionsSemantics } from '@lang/semantics';
import grammarSrc from '@lang/transition.ohm?raw';
import { debugParse } from './transitionParser';

type Token = { from: number; to: number; cls: string };

export type OhmHighlighterOptions = {
  grammarURL: string;
  startRule?: string;
};

export function ohmHighlighter(options: OhmHighlighterOptions): Extension {
  const startRule = options.startRule ?? undefined;

  const setGrammar = StateEffect.define<ohm.Grammar | null>();

  const grammarField = StateField.define<ohm.Grammar | null>({
    create() {
      try {
        return ohm.grammar(grammarSrc);
      } catch {
        return null;
      }
    },
    update(value, tr) {
      for (const e of tr.effects) {
        if (e.is(setGrammar)) return e.value;
      }
      return value;
    }
  });

  function computeDecorations(text: string, grammar: ohm.Grammar | null) {
    if (!grammar) return Decoration.none;

    debugParse(text)
    const result = grammar.match(text, startRule);
    if (result.failed()) return Decoration.none;

    // Reuse shared semantics and extend it with a tokenization operation
    const baseSemantics = createTransitionsSemantics(grammar);
    const semantics = grammar.extendSemantics(baseSemantics);

    semantics.addOperation<Token[]>(
      'tokens',
      {
        _iter(this: any, ...children: any[]) {
          const tokens: Token[] = [];
          for (const ch of children) {
            if (typeof ch?.tokens === 'function') tokens.push(...ch.tokens());
          }
          return tokens;
        },
        _nonterminal(this: any, ...children: any[]) {
          const tokens: Token[] = [];
          for (const ch of children) {
            if (typeof ch?.tokens === 'function') tokens.push(...ch.tokens());
          }
          return tokens;
        },
        _terminal(this: any) {
          const text: string = this.sourceString;
          const from: number = this.source.startIdx;
          const to: number = this.source.endIdx;
          const tokens: Token[] = [];
          if (text === '->') tokens.push({ from, to, cls: 'cm-transition-operator' });
          if (text === '[' || text === ']') tokens.push({ from, to, cls: 'cm-transition-bracket' });
          if (text === '.') tokens.push({ from, to, cls: 'cm-transition-punct' });
          return tokens;
        },

        // Domain-specific rules
        title(this: any, _chars: any) {
          const s = this.source;
          return [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-title' }];
        },
        tag_content(this: any, _chars: any) {
          const s = this.source;
          return [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-tag' }];
        },
        from(this: any, _chars: any) {
          const s = this.source;
          return s.startIdx === s.endIdx ? [] : [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-from' }];
        },
        to(this: any, _chars: any) {
          const s = this.source;
          return s.startIdx === s.endIdx ? [] : [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-to' }];
        },
        digit(this: any, _d: any) {
          const s = this.source;
          return [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-number' }];
        }
      } as any
    );

    const raw = semantics(result).tokens() as any;
    const tokens: Token[] = (Array.isArray(raw) ? raw.flat(Infinity) : [])
      .filter((t: any) => t && typeof t.from === 'number' && typeof t.to === 'number' && t.to > t.from)
      .sort((a: Token, b: Token) => (a.from - b.from) || (a.to - b.to));

    if (!tokens.length) return Decoration.none;

    const builder = new RangeSetBuilder<Decoration>();
    for (const t of tokens) builder.add(t.from, t.to, Decoration.mark({ class: t.cls }));
    return builder.finish();
  }

  const decoField = StateField.define({
    create(state) {
      return Decoration.none;
    },
    update(decos, tr) {
      let mapped = decos.map(tr.changes);
      const grammar = tr.state.field(grammarField);
      const text = tr.state.doc.toString();
      const built = computeDecorations(text, grammar);
      // If computeDecorations returned Decoration.none or a custom set, prefer that
      if ((built as any) === Decoration.none) return built;
      return built;
    },
    provide: (f) => EditorView.decorations.from(f)
  });

  return [grammarField, decoField];
}


