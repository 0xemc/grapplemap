import * as ohm from "ohm-js";
import { syntax, transition, position } from "./operations";
import type { Position, Transition } from "./types";


export const parse = (grammar: ohm.Grammar, text: string): { transitions: Transition[], syntax: any, positions: Position[] } | undefined => {
    const semantics = grammar.createSemantics()
    semantics.addOperation('transitions', transition)
    semantics.addOperation('syntax', syntax)
    semantics.addOperation('positions', position)
    const result = grammar.match(text)
    if (result.succeeded()) {
        const transitions = semantics(result).transitions()
        const syntax = semantics(result).syntax()
        const positions = semantics(result).positions()
        return { transitions, syntax, positions }
    } else {
        console.error(result.shortMessage)
        console.error(result.message)
    }

}


