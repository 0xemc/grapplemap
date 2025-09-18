import fs from "fs";
import * as ohm from "ohm-js";

// 1. Load the grammar file as text
const grammarContents = fs.readFileSync("./transition.block.ohm", "utf-8");

// 2. Compile the grammar
const grammar = ohm.grammar(grammarContents);

// 3. Create semantics to extract node names
// const semantics = grammar.createSemantics().addOperation("nodes", {
//   _iter(...children) {
//     console.log(children.length);
//     return children.map((child) => child.nodes());
//   },
//   lines(lines) {
//     return lines.nodes();
//   },
//   line(rule, _eol) {
//     return rule.nodes();
//   },
//   positions(from, arrow, to) {
//     return [from.sourceString.trim(), to.sourceString.trim()];
//   },
//   comment(_, comment) {
//     return comment.sourceString.trim();
//   },
//   step(tab, digit, dot, space, step) {
//     return step.sourceString.trim();
//   },
// });

const semantics = grammar.createSemantics().addOperation("nodes", {
  _iter(...children) {
    return children.map((child) => child.nodes());
  },
  Lines(Line, _eol, _, __eol) {
    return [Line.sourceString];
  },
  Line(line) {
    return [line.sourceString];
  },
});

// 4. Read input from file and match against grammar
const input = fs.readFileSync("./test.grpl", "utf-8");
const matchResult = grammar.match(input);

console.log(grammar.trace(input));

if (matchResult.succeeded()) {
  const results = semantics(matchResult).nodes();
  // Filter out null values (comments and empty lines)
  const transitions = results.filter((result) => result !== null);
  console.log(transitions);
  // -> [["Side Control", "Side Guard"]]
} else {
  console.error(matchResult.message);
}
