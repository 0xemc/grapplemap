import { getContext, setContext } from 'svelte';

const KEY: unique symbol = Symbol('share-mode');

export function setSharedModeContext(enabled: boolean) {
    setContext(KEY, enabled);
}

export function getSharedModeContext(): boolean {
    try {
        const v = getContext<boolean>(KEY);
        return !!v;
    } catch {
        return false;
    }
}


