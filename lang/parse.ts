import fs from "fs";
import * as ohm from "ohm-js";
import { transition } from "./operations";
import type { Transition } from "./types";

const grammarUrl = new URL('./transition.ohm', import.meta.url);
const grammarContents = fs.readFileSync(grammarUrl, "utf-8");
const grammar = ohm.grammar(grammarContents);
const semantics = grammar.createSemantics()

semantics.addOperation('transitions', transition)

export const parse = (text: string): { transitions: Transition[] } | undefined => {
    const result = grammar.match(text)
    if (result.succeeded()) {
        const transitions = semantics(result).transitions()
        return { transitions }
    } else {
        console.error(result.shortMessage)
        console.error(result.message)
    }

}


