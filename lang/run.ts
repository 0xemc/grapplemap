import fs from "fs";
import * as ohm from "ohm-js";

// 1. Load the grammar file as text
const grammarContents = fs.readFileSync("./transition.ohm", "utf-8");

// 2. Compile the grammar
const grammar = ohm.grammar(grammarContents);

// 3. Create semantics to extract node names
const semantics = grammar.createSemantics().addOperation("nodes", {
  _iter(...children) {
    console.log(children.length);
    return children.map((child) => child.nodes());
  },
  Lines(lines) {
    return lines.nodes();
  },
  Line(rule) {
    return rule.nodes();
  },
  Positions(from, _1, arrow, _2, to, _eol) {
    return [from.sourceString.trim(), to.sourceString.trim()];
  },
});

// 4. Read input from file and match against grammar
const input = fs.readFileSync("./test.grpl", "utf-8");
const matchResult = grammar.match(input);

if (matchResult.succeeded()) {
  const results = semantics(matchResult).nodes();
  // Filter out null values (comments and empty lines)
  const transitions = results.filter((result) => result !== null);
  console.log(transitions);
  // -> [["Side Control", "Side Guard"]]
} else {
  console.error(matchResult.message);
}
