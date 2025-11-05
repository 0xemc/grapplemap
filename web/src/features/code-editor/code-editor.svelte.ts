


import { getContext, setContext } from "svelte"

export class GraphState {
    #active_file_id?: number = $state();

    get active_file_id() {
        return this.#active_file_id
    }

    set active_file_id(id: number | undefined) {
        this.#active_file_id = id;
    }
}

const KEY = Symbol('code-editor')

export function setCodeEditorContext() {
    return setContext(KEY, new GraphState())
}

export function getCodeEditorContext() {
    return getContext<GraphState>(KEY)
}