import fs from "fs";
import * as ohm from "ohm-js";
import { createTransitionsSemantics } from "./semantics";

const grammarContents = fs.readFileSync("./transition.ohm", "utf-8");

const grammar = ohm.grammar(grammarContents);

const parseTransitions = createTransitionsSemantics(grammar);

const input = fs.readFileSync("./test.grpl", "utf-8");
const matchResult = grammar.match(input);

// console.log(grammar.trace(input));

if (matchResult.succeeded()) {
  const results = parseTransitions(matchResult).transitions();
  console.log("results:", JSON.stringify(results, null, 2));
} else {
  console.error(matchResult.message);
}
