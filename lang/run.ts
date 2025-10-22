import fs from "fs";
import { parse } from "./parse";
import * as ohm from "ohm-js"
// Accept an argument, if '--recipe' or '-r' passed use transition.json recipe version
let useRecipe = false;
const args = process.argv.slice(2);
if (args.includes('--recipe') || args.includes('-r')) {
    useRecipe = true;
}

let grammar;
if (useRecipe) {
    // Import JSON recipe instead of .ohm text
    const recipePath = new URL('./recipes/transition.json', import.meta.url);
    const recipe = JSON.parse(fs.readFileSync(recipePath, "utf-8"));
    grammar = ohm.makeRecipe(recipe);
} else {
    const grammarUrl = new URL('./transition.ohm', import.meta.url);
    const grammarContents = fs.readFileSync(grammarUrl, "utf-8");
    grammar = ohm.grammar(grammarContents);
}

const input = fs.readFileSync("./welcome.grpl", "utf-8");

const { transitions } = parse(grammar, input) ?? {}

console.log(transitions)