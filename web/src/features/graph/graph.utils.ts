import { MarkerType, type Edge, type EdgeProps, type InternalNode, type Node } from "@xyflow/svelte";
import { groupBy } from "remeda";
import * as Dagre from '@dagrejs/dagre';
import type { DBTransition } from "$lib/db/tables/transitions";
import type { PositionModifier } from "@lang/types";
import type { DBPosition } from "$lib/db/tables/positions";

export function transitionsToEdges(trs: DBTransition[]): Edge<{ transitions: DBTransition[] }, 'transition'>[] {
    const groups = groupBy(trs, (t) => `${t.from}__${t.to}`);

    return Object.entries(groups).map(([, items]) => {
        // const [from, to] = key.split('__');
        const { from, to, fromTag = "", toTag = "" } = items[0];

        const fromId = `${from}${fromTag}`
        const toId = `${to}${toTag}`

        return {
            id: `${fromId}->${toId}`,
            source: fromId,
            target: toId,
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
    id: string;
    position: { x: number; y: number };
    type?: string;
    data: {
        label: string;
        modifier?: PositionModifier;
        tags?: string[];
    };
    measured?: { width?: number; height?: number };
};

export type PositionNodeData = {
    label: string;
    modifier?: PositionModifier;
    tags?: string[];
};

export function positionToNode(position: DBPosition): (GraphNode & { data: PositionNodeData }) {
    return {
        id: `${position.title}${position.modifier ?? ''}`,
        position: { x: 0, y: 0 },
        type: "position",
        data: { label: `${position.title}`, modifier: position.modifier, tags: position.tags }
    }
}

export function transitionToNodes(tr?: DBTransition): (GraphNode & { data: { tag?: PositionModifier } })[] {
    return tr
        ? [
            {
                id: `${tr.from}${tr.fromTag ?? ''}`,
                position: { x: 0, y: 0 },
                type: "position",
                data: { label: `${tr.from}`, tag: tr.fromTag }
            },
            {
                id: `${tr.to}${tr.toTag ?? ''}`,
                position: { x: 0, y: 0 },
                type: "position",
                data: { label: `${tr.to}`, tag: tr.toTag }
            }
        ]
        : [];
}



export function getSelfLoopPath(edge: EdgeProps, node?: InternalNode<Node>) {
    const sy = edge.sourceY

    const box = measureEdgeBox(edge)

    // const pad = 20;   // gap from node before first corner
    const w = (box.width / 3);     // loop width to the right
    const h = SELF_LOOP_TOP_PAD;     // loop height

    // first corner just to the right of the node
    const x1 = (node?.position.x ?? 0) + (node?.measured.width ?? 0);
    const y1 = (node?.position.y ?? 0) + (node?.measured.height ?? 0) / 2;

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

// Shared constant used by layout/overlays to reserve headroom for self loops
export const SELF_LOOP_TOP_PAD = 40;

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
    const transitions =
        ((edge.data as { transitions?: DBTransition[] } | undefined)?.transitions ?? []);

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
    g.setGraph({ rankdir: options.direction });

    // ---- Self-loop spacers ---------------------------------------------------
    // For each self-referential edge we create a hidden "anchor" node with the
    // same dimensions as the edge's label box. We then add a constraint edge
    // from the anchor to the source to make Dagre reserve headroom/space.
    // Simplified: rely on local node inflation for self-loops (no proxy edges)
    type ConstraintEdge = { id: string; source: string; target: string; minlen?: number; weight?: number };
    const spacerNodes: GraphNode[] = [];
    const constraintEdges: ConstraintEdge[] = [];
    const pinEdges: ConstraintEdge[] = [];

    // Edges: add real edges with measured label sizes
    for (const edge of edges) {
        const { width, height } = measureEdgeBox(edge);
        // Expose box width for overlays (read-only, safe to attach)
        const d = (edge.data ?? {}) as Record<string, unknown>;
        (edge as unknown as { data: Record<string, unknown> }).data = { ...d, __boxWidth: width, __boxHeight: height };
        g.setEdge(edge.source, edge.target, {
            width,
            height,
            labelpos: 'c',
            minlen: 1,
            weight: 1
        });
    }
    // Constraint edges: zero-size, just spacing constraints
    for (const ce of constraintEdges) {
        g.setEdge(ce.source, ce.target, {
            width: 0,
            height: 0,
            labelpos: 'c',
            minlen: ce.minlen ?? 1,
            weight: ce.weight ?? 0.1
        });
    }
    for (const pe of pinEdges) {
        g.setEdge(pe.source, pe.target, {
            width: 0,
            height: 0,
            labelpos: 'c',
            minlen: pe.minlen ?? 1,
            weight: pe.weight ?? 0.01
        });
    }

    // Nodes: include spacer nodes in layout graph but we'll not return them.
    // Also inflate node size slightly if it has a self-loop so Dagre leaves local room.
    const EXTRA_TOP_MARGIN = 16; // additional headroom above loop
    const loopTopExtra = new Map<string, number>();
    for (const e of edges) {
        if (e.source !== e.target) continue;
        const { height } = measureEdgeBox(e);
        const extra = SELF_LOOP_TOP_PAD + Math.ceil(height / 2) + EXTRA_TOP_MARGIN;
        loopTopExtra.set(e.source, Math.max(loopTopExtra.get(e.source) ?? 0, extra));
    }
    [...nodes, ...spacerNodes].forEach((node) => {
        const baseW = node.measured?.width ?? 120;
        const baseH = node.measured?.height ?? 60;
        const extraY = loopTopExtra.get(node.id) ?? 0;
        const inflateX = extraY ? 120 : 0; // rough horiz margin for loop label
        const inflateY = extraY;
        g.setNode(node.id, {
            ...node,
            width: baseW + inflateX,
            height: baseH + inflateY
        });
    });

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


export function b64ToUtf8(input: string) {
    // Normalize: decode percent-encoding if present, fix spaces/URL-safe chars, add padding
    let s = input.trim();
    try {
        // If the param was percent-encoded, decode it first (best-effort)
        s = decodeURIComponent(s);
    } catch {
        // ignore
    }
    // application/x-www-form-urlencoded turns '+' into space
    s = s.replace(/ /g, '+');
    // URL-safe base64 -> standard
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    // pad to multiple of 4
    const pad = s.length % 4;
    if (pad) s += '='.repeat(4 - pad);

    const binary = atob(s);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
}