// Shared semantics factory for the Transition grammar.
// This file intentionally avoids importing Node-only modules so it can be reused in the browser.

export function createTransitionsSemantics(grammar: any) {
  return grammar
    .createSemantics()
    .addOperation('transitions', {
      blocks(first: any, _a: any, rest: any, _end: any) {
        return [...first.transitions(), ...rest.transitions().flat().flat()];
      },
      _iter(this: any, ...items: any[]) {
        return items.map((i) => i.transitions());
      },
      transition_block(tags: any, title: any, _nl: any, from_to: any, steps: any, _tail: any) {
        return {
          tags: tags.sourceString.trim(),
          title: title.sourceString.trim(),
          ...from_to.transitions(),
          steps: steps.transitions()
        };
      },
      from_to(from: any, _arrow: any, to: any, _nl: any) {
        return { from: from.sourceString.trim(), to: to.sourceString.trim() };
      },
      step(_n: any, _dot: any, _sp: any, textNode: any, _nl: any) {
        return textNode.sourceString.trim();
      },
      _terminal(this: any) {
        return this.sourceString;
      }
    } as any);
}


