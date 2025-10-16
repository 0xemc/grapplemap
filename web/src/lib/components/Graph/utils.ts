import type { Transition } from "@lang/types";

export function transitionToEdge(tr: Transition) {
    return {
        id: tr.title,
        source: tr.from,
        target: tr.to,
        animated: true,
        label: tr.title,
        type: 'transition'
    };
}

export function transitionToNodes(tr?: Transition) {
    return tr
        ? [
            {
                id: tr.from,
                position: { x: 0, y: 0 },
                data: { label: tr.from }
            },
            {
                id: tr.to,
                position: { x: 0, y: 0 },
                data: { label: tr.to }
            }
        ]
        : [];
}