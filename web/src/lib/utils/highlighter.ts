import type { Extension } from '@codemirror/state';
import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { syntax as tokensOperation, transition } from '@lang/operations';
import transitionRecipe from '@lang/recipes/transition.json';
import type { Token } from '@lang/types';
import * as ohm from 'ohm-js';
import { debugParse } from './transitionParser';

export type OhmHighlighterOptions = {
	startRule?: string;
};

export function ohmHighlighter(options: OhmHighlighterOptions): Extension {
	const startRule = options.startRule ?? undefined;

	const setGrammar = StateEffect.define<ohm.Grammar | null>();

	const grammarField = StateField.define<ohm.Grammar | null>({
		create() {
			return ohm.makeRecipe(transitionRecipe);
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

		debugParse(text);
		const result = grammar.match(text, startRule);
		if (result.failed()) return Decoration.none;

		// Reuse shared semantics and extend it with a tokenization operation
		const baseSemantics = grammar.createSemantics().addOperation('transitions', transition);
		const semantics = grammar.extendSemantics(baseSemantics);

		semantics.addOperation<Token[]>('tokens', tokensOperation);

		const raw = semantics(result).tokens() as any;
		const tokens: Token[] = (Array.isArray(raw) ? raw.flat(Infinity) : [])
			.filter((t) => t && typeof t.from === 'number' && typeof t.to === 'number' && t.to > t.from)
			.sort((a: Token, b: Token) => a.from - b.from || a.to - b.to);

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
			const mapped = decos.map(tr.changes);
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
