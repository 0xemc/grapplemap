import fs from "fs";
import * as ohm from "ohm-js";
import { syntax, transition } from "./operations";
import type { Transition } from "./types";


export const parse = (grammar: ohm.Grammar, text: string): { transitions: Transition[] } | undefined => {
    const semantics = grammar.createSemantics()
    semantics.addOperation('transitions', transition)
    semantics.addOperation('syntax', syntax)
    const result = grammar.match(text)
    if (result.succeeded()) {
        const transitions = semantics(result).transitions()
        const syntax = semantics(result).syntax()
        return { transitions, syntax }
    } else {
        console.error(result.shortMessage)
        console.error(result.message)
    }

}


