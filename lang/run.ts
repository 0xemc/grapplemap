import fs from "fs";
import * as ohm from "ohm-js";

// 1. Load the grammar file as text
const grammarContents = fs.readFileSync("./transition.ohm", "utf-8");

// 2. Compile the grammar
const grammar = ohm.grammar(grammarContents);

// 3. Create semantics to extract node names
const semantics = grammar.createSemantics().addOperation("nodes", {
  Start(ft) {
    return ft.nodes();
  },
  FromTo(from, _1, arrow, _2, to) {
    return [from.sourceString.trim(), to.sourceString.trim()];
  },
});

// 4. Read input from file and match against grammar
const input = fs.readFileSync("./test.grpl", "utf-8");
const matchResult = grammar.match(input);

if (matchResult.succeeded()) {
  console.log(semantics(matchResult).nodes());
  // -> ["side-control", "side-guard"]
} else {
  console.error(matchResult.message);
}
