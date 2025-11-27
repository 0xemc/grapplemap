import { isNonNullish } from "remeda"
import { getContext, setContext } from "svelte"

export class GraphState {
    #selected_transition?: number = $state()
    #modal = $state(false)

    get selected_transition() {
        return this.#selected_transition
    }

    set selected_transition(n: number | undefined) {
        this.#selected_transition = n
        if (isNonNullish(n)) {
            this.openModal();
        } else {
            this.closeModal()
        }
    }

    get modal() {
        return this.#modal;
    }

    set modal(v: boolean) {
        this.#modal = v;
    }

    openModal() {
        this.#modal = true
    }

    closeModal() {
        this.#modal = false
    }

}
const KEY = Symbol('graph')

export function setGraphContext() {
    return setContext(KEY, new GraphState())
}

export function getGraphContext() {
    return getContext<GraphState>(KEY)
}