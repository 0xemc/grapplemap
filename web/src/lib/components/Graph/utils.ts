import type { Transition } from "@lang/types";
import type { EdgeProps, InternalNode, Node } from "@xyflow/svelte";

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



export function getSelfLoopPath(edge: EdgeProps, node: InternalNode<Node>) {
    const sx = edge.sourceX
    const sy = edge.sourceY

    // const pad = 20;   // gap from node before first corner
    const w = 30;     // loop width to the right
    const h = 70;     // loop height

    // first corner just to the right of the node
    const x1 = sx;
    const y1 = sy;

    // outer right and bottom
    const x2 = x1 + w;
    const y2 = sy - h;


    const x3 = x1 - (node.measured.width ?? 0) / 4;
    const y3 = y1 - (node.measured.height ?? 0) / 2;

    console.log(node)

    // rectangular loop with sharp corners
    const d = [
        `M ${x1} ${y1}`, // start beside the node (avoids drawing under it)
        `L ${x2} ${y1}`, // right
        `L ${x2} ${y2}`, // down
        `L ${x3} ${y2}`, // left
        `L ${x3} ${y3}`  // up to close
    ].join(' ');

    // label midway on the outer right segment
    const lx = x2;
    const ly = sy - h;

    return [d, lx, ly] as const;
}

export function measureLabel(text: string): { width: number; height: number } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    // keep this in sync with your EdgeLabel styles
    ctx.font = '14px Inter, system-ui, sans-serif';
    const w = Math.ceil(ctx.measureText(text).width);
    // padding + line height roughly matching your EdgeLabel class
    return { width: w + 20, height: 28 };
}