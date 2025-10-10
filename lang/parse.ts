import fs from "fs";
import * as ohm from "ohm-js";
import { transition } from "./operations";

const grammarContents = fs.readFileSync("./transition.ohm", "utf-8");
const grammar = ohm.grammar(grammarContents);
const semantics = grammar.createSemantics()

semantics.addOperation('transitions', transition)

export const parse = (text: string) => {
    const result = grammar.match(text)
    if (result.succeeded()) {
        const transitions = semantics(result).transitions()
        return { transitions }
    } else {
        console.error(result.shortMessage)
        console.error(result.message)
    }

}


