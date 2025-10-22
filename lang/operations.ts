const transition = {
  blocks(_: any, block: any, __: any, ___: any) {
    return [...block.transitions().flat().flat()];
  },
  block(_: any, transition: any, __: any) {
    return transition.transitions()
  },
  _iter(this: any, ...items: any[]) {
    return items.map((i) => i.transitions());
  },
  transition_block(_: any, tags: any, title: any, _nl: any, from_to: any, steps: any, __: any, ___: any) {
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
};

export {
  transition
}