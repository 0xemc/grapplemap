import fs from "fs";
import { parse } from "./parse";
import * as ohm from "ohm-js"

const input = fs.readFileSync("./test.grpl", "utf-8");
const grammarUrl = new URL('./transition.ohm', import.meta.url);
const grammarContents = fs.readFileSync(grammarUrl, "utf-8");
const grammar = ohm.grammar(grammarContents);

const { transitions } = parse(grammar, input) ?? {}

console.log(transitions)