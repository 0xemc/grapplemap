import fs from "fs";
import * as ohm from "ohm-js";
import { transition } from "./operations";
import type { Transition } from "./types";


export const parse = (grammar: ohm.Grammar, text: string): { transitions: Transition[] } | undefined => {
    const semantics = grammar.createSemantics()
    semantics.addOperation('transitions', transition)
    const result = grammar.match(text)
    if (result.succeeded()) {
        const transitions = semantics(result).transitions()
        return { transitions }
    } else {
        console.error(result.shortMessage)
        console.error(result.message)
    }

}


