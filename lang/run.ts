import fs from "fs";
import * as ohm from "ohm-js";

const grammarContents = fs.readFileSync("./transition.ohm", "utf-8");

const grammar = ohm.grammar(grammarContents);

const parseTransitions = grammar.createSemantics().addOperation("transitions", {
  blocks(first, _, rest, _end) {
    return [first.transitions(), ...rest.transitions()];
  },
  _iter(...items) {
    return items.map((i) => i.transitions());
  },
  transition_block(title, _nl, from_to, steps, _tail) {
    return {
      title: title.sourceString.trim(),
      ...from_to.transitions(),
      steps: steps.transitions(),
    };
  },
  from_to(from, _arrow, to, _nl) {
    return { from: from.sourceString.trim(), to: to.sourceString.trim() };
  },
  step(_n, _dot, _sp, text, _nl) {
    return text.sourceString.trim();
  },
  _terminal() {
    return this.sourceString;
  },
});

const input = fs.readFileSync("./test.grpl", "utf-8");
const matchResult = grammar.match(input);

// console.log(grammar.trace(input));

if (matchResult.succeeded()) {
  const results = parseTransitions(matchResult).transitions();
  console.log("results:", JSON.stringify(results, null, 2));
} else {
  console.error(matchResult.message);
}
