

import type { OhmNode, Token } from "./types";

export const transition = {
  blocks(_: any, block: any, __: any, ___: any) {
    return [...block.transitions().flat().flat()];
  },
  block(_: any, transition: any, __: any) {
    return transition.transitions()
  },
  tags(items: any, _nl: any) {
    return items.transitions().filter((s: string) => s.trim()).map((s: string) => s.trim());
  },
  tag(_open: any, content: any, _close: any) {
    return content.sourceString.trim();
  },
  _iter(this: any, ...items: any[]) {
    return items.map((i) => i.transitions());
  },
  transition_block(_: any, tags: any, title: any, _nl: any, _require_from_to: any, from_to: any, steps: any, __: any, ___: any) {
    return {
      tags: tags.transitions().flat(),
      title: title.sourceString.trim(),
      ...from_to.transitions(),
      steps: steps.transitions()
    };
  },

  position_block(_: any, __: any, ___: any, ____: any, _____: any) {
    return []
  },

  // UPDATED: use structured from/to
  from_to(from: any, _arrow: any, to: any, _nl: any) {
    const f = from.transitions();
    const t = to.transitions();
    return { from: f.position, fromTag: f.tag, to: t.position, toTag: t.tag };
  },

  // NEW: capture position and optional tag
  // from = position_char* (from_tag " ")? 
  from(pos: any, opt: any, _: any) {
    const position = pos.sourceString.trim();
    const tag = opt.children.length ? opt.children[0].transitions() : undefined; // first child is from_tag
    return { position, tag };
  },

  // NEW: capture position and optional tag
  // to = position_char* (to_tag)?
  to(pos: any, opt: any) {
    const position = pos.sourceString.trim();
    const tag = opt.children.length ? opt.children[0].transitions() : undefined; // only child is to_tag
    return { position, tag };
  },

  // NEW: delegate to concrete tag kind
  from_tag(tag: any) { return tag.transitions(); },
  to_tag(tag: any) { return tag.transitions(); },

  // NEW: map tag tokens to values
  bottom_tag(_: any) { return 'b'; },
  top_tag(_: any) { return 't'; },
  attacking_tag(_: any) { return 'a'; },
  defending_tag(_: any) { return 'd'; },

  step(_n: any, _dot: any, _sp: any, textNode: any, _nl: any) {
    return textNode.sourceString.trim();
  },
  _terminal(this: any) {
    return this.sourceString;
  },
};

export const position = {
  blocks(_: any, block: any, __: any, ___: any) {
    return [...block.positions().flat().flat()];
  },
  block(_: any, transition: any, __: any) {
    return transition.positions()
  },
  transition_block(_: any, tags: any, title: any, _nl: any, _require_from_to: any, from_to: any, steps: any, __: any, ___: any) {
    return []
  },
  // Args: (skip, position_tags, position_name, _not_from_to, _rest, _skip)
  position_block(_skip: any, position_tags: any, position_name: any, _not_from_to: any, _rest: any) {
    // Extract the main position name and any tags (if present)
    const { title, modifier } = position_name.positions();
    const tags = position_tags.children.length ? position_tags.positions().flat() : [];
    // Return normalized { name, tags } object for the position
    return [{ title, modifier, tags }];
  },
  position_name(position_title: any, position_modifier: any) {
    // Return the position name as a trimmed string
    const title = position_title.positions()
    const modifier = position_modifier.children[0]?.positions()
    return { title, modifier }
  },
  position_title(title: any) {
    return title.sourceString.trim();
  },
  position_modifier(modifier: any) {
    return modifier.positions();
  },
  bottom_tag(_: any) { return 'b'; },
  top_tag(_: any) { return 't'; },
  attacking_tag(_: any) { return 'a'; },
  defending_tag(_: any) { return 'd'; },
  position_tags(items: any) {
    return items.transitions().filter((s: string) => s.trim()).map((s: string) => s.trim());
  },
  tags(items: any, _nl: any) {
    return items.transitions().filter((s: string) => s.trim()).map((s: string) => s.trim());
  },
  tag(_open: any, content: any, _close: any) {
    return content.sourceString.trim();
  },
  _iter(this: any, ...items: any[]) {
    return items.map((i) => i.positions());
  },
}

export const syntax = {
  _iter(this: OhmNode, ...children: OhmNode[]): Token[] {
    const tokens: Token[] = [];
    for (const ch of children) {
      if (typeof ch?.tokens === 'function') tokens.push(...ch.tokens());
    }
    return tokens;
  },
  _nonterminal(this: OhmNode, ...children: OhmNode[]): Token[] {
    const tokens: Token[] = [];
    for (const ch of children) {
      if (typeof ch?.tokens === 'function') tokens.push(...ch.tokens());
    }
    return tokens;
  },
  _terminal(this: OhmNode): Token[] {
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
  title(this: OhmNode, _chars: OhmNode): Token[] {
    const s = this.source;
    return [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-title' }];
  },
  tag_content(this: OhmNode, _chars: OhmNode): Token[] {
    const s = this.source;
    return [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-tag' }];
  },
  // from = position_char* (from_tag " ")?
  // Arity: 3 (position, tag?, space?)
  from(this: OhmNode, _position: OhmNode, _maybeTag: OhmNode, _maybeSpace: OhmNode): Token[] {
    const s = this.source;
    return s.startIdx === s.endIdx ? [] : [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-from' }];
  },
  // to = position_char* (to_tag)?
  // Arity: 2 (position, tag?)
  to(this: OhmNode, _position: OhmNode, _maybeTag: OhmNode): Token[] {
    const s = this.source;
    return s.startIdx === s.endIdx ? [] : [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-to' }];
  },
  digit(this: OhmNode, _d: OhmNode): Token[] {
    const s = this.source;
    return [{ from: s.startIdx, to: s.endIdx, cls: 'cm-transition-number' }];
  }
};
