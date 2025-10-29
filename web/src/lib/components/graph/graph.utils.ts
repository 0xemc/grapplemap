import { MarkerType, type Edge, type EdgeProps, type InternalNode, type Node } from "@xyflow/svelte";
import { groupBy } from "remeda";
import * as Dagre from '@dagrejs/dagre';
import type { Transition } from "$lib/db/tables/transitions";

export function transitionsToEdges(trs: Transition[]): Edge<{ transitions: Transition[] }, 'transition'>[] {
    const groups = groupBy(trs, (t) => `${t.from}__${t.to}`);

    return Object.entries(groups).map(([key, items]) => {
        const [from, to] = key.split('__');

        return {
            id: `${from}->${to}`,
            source: from,
            target: to,
            type: 'transition',
            animated: true,
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
            data: {
                transitions: items,
            },
        };
    });
}
export type GraphNode = {
    id: string,
    position: { x: number, y: number },
    data: { label: string }
};

export function transitionToNodes(tr?: Transition): GraphNode[] {
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



export function getSelfLoopPath(edge: EdgeProps, node?: InternalNode<Node>) {
    const sy = edge.sourceY

    // const pad = 20;   // gap from node before first corner
    const w = 50;     // loop width to the right
    const h = 40;     // loop height

    // first corner just to the right of the node
    const x1 = node?.position.x + node?.measured.width;
    const y1 = node?.position.y + node?.measured.height / 2;

    // outer right and bottom
    const x2 = x1 + w;
    const y2 = sy - h;


    const x3 = x1 - (node?.measured.width ?? 0) / 4;
    const y3 = y1 - (node?.measured.height ?? 0) / 2;


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

// add/replace in graph.utils.ts
function measureText(text: string, font = '14px Inter, system-ui, sans-serif'): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;
    return Math.ceil(ctx.measureText(text).width);
}

function measureEdgeBox(edge: Edge): { width: number; height: number } {
    // Content you render in <EdgeLabel> is a column of TransitionRow buttons
    const transitions = ((edge.data as any)?.transitions ?? []) as Transition[];

    // Tailwind sizes used in UI
    const containerPad = 48; // p-12 => 48px each side
    const rowHPad = 8;       // p-2 => 8px each side
    const rowHeight = 32;    // ~button row height incl. vertical padding
    const divider = 1;       // divide-y line thickness
    const iconSpace = 20;    // space for the video icon/right adornments

    const maxRowText = Math.max(0, ...transitions.map(t => measureText(t.title)));
    const contentWidth = maxRowText + rowHPad * 2 + iconSpace;

    const width = contentWidth + containerPad * 2;
    const height =
        containerPad * 2 +
        transitions.length * rowHeight +
        Math.max(0, transitions.length - 1) * divider;

    return { width, height };
}

export function getLayoutedElements(
    nodes: GraphNode[],
    edges: Edge[],
    options: { direction: 'LR' | 'BT' }
) {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    // g.setGraph({ rankdir: options.direction, ranksep: 50, nodesep: 100, edgesep: 300 });
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => {
        const { width, height } = measureEdgeBox(edge); // measure your label if you render one

        g.setEdge(edge.source, edge.target, {
            // width: labelWidth,
            // height: (edge.data?.transitions?.length ?? 0) * 50, //@todo extract this hard coded 50px value
            width,
            height,
            labelpos: 'c', // "l" | "r" | "c"
            minlen: edge.minlen ?? 1, // >1 forces extra rank gaps for this edge
            weight: edge.weight ?? 1 // crossing minimization priority
        });
    });

    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the Svelte Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return {
                ...node,
                position: { x, y },
                sourcePosition: options.direction === 'LR' ? 'right' : 'top',
                targetPosition: options.direction === 'LR' ? 'left' : 'bottom'
            };
        }),
        edges
    };
}