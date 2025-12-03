import type { DBPosition } from '$lib/db/tables/positions';
import type { DBTransition } from '$lib/db/tables/transitions';
import type { Edge } from '@xyflow/svelte';
import { MarkerType } from '@xyflow/svelte';
import { getLayoutedElements, type GraphNode } from './graph.utils';

export type KeyAccessor<T> = (item: T) => string | number | undefined;
export type GroupKeySpec<T> = Array<KeyAccessor<T>>;

export type OrderSpec<T> = {
    key: KeyAccessor<T>;
    projection?: (v: unknown) => number | string | undefined;
    comparator?: (a: unknown, b: unknown) => number;
    direction?: 'asc' | 'desc';
};

export function composeKey<T>(spec: GroupKeySpec<T>): (item: T) => string {
    return (item) =>
        spec
            .map((fn) => safeToString(fn(item)))
            .filter((v) => v.length > 0)
            .join('__');
}

function safeToString(v: unknown): string {
    if (v === undefined || v === null) return '';
    return String(v);
}

export function numericPart(input: unknown): number | undefined {
    const s = String(input ?? '');
    const m = s.match(/[-+]?\d*\.?\d+/);
    return m ? Number(m[0]) : undefined;
}

// ---------- Accessor helpers ----------

export const positionId: KeyAccessor<DBPosition> = (p) => `${p.title}${p.modifier ?? ''}`;
export const fileIdP: KeyAccessor<DBPosition> = (p) => p.file_id;
export function findTag(tags: string[] | undefined, name: string): string | undefined {
    if (!tags || !name) return undefined;
    const needle = name.toLowerCase();
    for (const t of tags) {
        const s = String(t ?? '');
        const lower = s.toLowerCase();
        // Accept exact match, "name:<...>", and "name <...>" to be content-agnostic
        if (lower === needle || lower.startsWith(needle + ':') || lower.startsWith(needle + ' ')) {
            return s;
        }
    }
    return undefined;
}
export const posTag =
    (name: string): KeyAccessor<DBPosition> =>
        (p) =>
            findTag(p.tags, name);

export const fromId: KeyAccessor<DBTransition> = (t) => `${t.from}${t.fromTag ?? ''}`;
export const toId: KeyAccessor<DBTransition> = (t) => `${t.to}${t.toTag ?? ''}`;
export const fileIdT: KeyAccessor<DBTransition> = (t) => t.file_id;
export const trTag =
    (name: string): KeyAccessor<DBTransition> =>
        (t) =>
            findTag(t.tags, name);

// Build a synthetic Position-like object for each transition side
type PositionLike = {
    title: string;
    modifier?: DBPosition['modifier'];
    tags?: string[];
    file_id: number;
};

function transitionSideAsPosition(t: DBTransition, side: 'from' | 'to'): PositionLike {
    return side === 'from'
        ? { title: t.from, modifier: t.fromTag, tags: t.tags, file_id: t.file_id }
        : { title: t.to, modifier: t.toTag, tags: t.tags, file_id: t.file_id };
}

// Convert a GroupKeySpec<DBPosition> to an accessor that can be applied to a transition side
export function sideKey<T extends DBTransition>(
    side: 'from' | 'to',
    spec: GroupKeySpec<DBPosition>
): KeyAccessor<T> {
    const key = composeKey<PositionLike>(spec as unknown as GroupKeySpec<PositionLike>);
    return (t: T) => key(transitionSideAsPosition(t, side));
}

// ---------- Node builders ----------

export function buildNodesFromPositions(
    positions: DBPosition[],
    posKeySpec: GroupKeySpec<DBPosition>
): Array<GraphNode & { type: 'position'; data: { label: string; modifier?: DBPosition['modifier']; tags?: string[] } }> {
    const key = composeKey(posKeySpec);
    const seen = new Set<string>();
    const nodes: Array<
        GraphNode & {
            type: 'position';
            data: { label: string; modifier?: DBPosition['modifier']; tags?: string[] };
        }
    > =
        [];

    for (const p of positions) {
        const id = key(p);
        if (seen.has(id)) continue;
        seen.add(id);
        nodes.push({
            id,
            position: { x: 0, y: 0 },
            type: 'position',
            data: { label: p.title, modifier: p.modifier, tags: p.tags }
        });
    }
    return nodes;
}

export function buildNodesFromTransitions(
    trs: DBTransition[],
    posKeySpec: GroupKeySpec<DBPosition>,
    posTagMap?: Map<string, string[]>
): Array<GraphNode & { type: 'position'; data: { label: string; modifier?: DBPosition['modifier']; tags?: string[] } }> {
    const keyFrom = sideKey('from', posKeySpec);
    const keyTo = sideKey('to', posKeySpec);

    const seen = new Set<string>();
    const nodes: Array<
        GraphNode & {
            type: 'position';
            data: { label: string; modifier?: DBPosition['modifier']; tags?: string[] };
        }
    > =
        [];

    const mergeTags = (a?: string[], b?: string[]) =>
        Array.from(new Set([...(a ?? []), ...(b ?? [])]));

    for (const t of trs) {
        const fromPosId = `${t.from}${t.fromTag ?? ''}`;
        const toPosId = `${t.to}${t.toTag ?? ''}`;

        const fId = safeToString(keyFrom(t));
        if (!seen.has(fId)) {
            seen.add(fId);
            nodes.push({
                id: fId,
                position: { x: 0, y: 0 },
                type: 'position',
                data: {
                    label: t.from,
                    modifier: t.fromTag,
                    tags: mergeTags(posTagMap?.get(fromPosId), t.tags)
                }
            });
        }

        const toIdStr = safeToString(keyTo(t));
        if (!seen.has(toIdStr)) {
            seen.add(toIdStr);
            nodes.push({
                id: toIdStr,
                position: { x: 0, y: 0 },
                type: 'position',
                data: {
                    label: t.to,
                    modifier: t.toTag,
                    tags: mergeTags(posTagMap?.get(toPosId), t.tags)
                }
            });
        }
    }

    return nodes;
}

// ---------- Edge builders ----------

export function buildEdgesFromTransitions(
    trs: DBTransition[],
    posKeySpec: GroupKeySpec<DBPosition>,
    edgeGroupSpec: GroupKeySpec<DBTransition> = []
): Edge<{ transitions: DBTransition[] }, 'transition'>[] {
    const fromKey = sideKey('from', posKeySpec);
    const toKey = sideKey('to', posKeySpec);
    const extraKey = composeKey(edgeGroupSpec);

    const groups = new Map<string, DBTransition[]>();
    for (const t of trs) {
        const k = [safeToString(fromKey(t)), safeToString(toKey(t)), safeToString(extraKey(t))]
            .filter(Boolean)
            .join('__');
        const arr = groups.get(k) ?? [];
        arr.push(t);
        groups.set(k, arr);
    }

    const edges: Edge<{ transitions: DBTransition[] }, 'transition'>[] = [];
    for (const [, items] of groups.entries()) {
        const t0 = items[0];
        let source = safeToString(fromKey(t0));
        let target = safeToString(toKey(t0));
        // Fallback to raw from/to ids if composed keys are empty for any reason
        if (!source) source = `${t0.from}${t0.fromTag ?? ''}`;
        if (!target) target = `${t0.to}${t0.toTag ?? ''}`;
        edges.push({
            id: `${source}->${target}`,
            source,
            target,
            type: 'transition',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { transitions: items }
        });
    }
    return edges;
}

// ---------- Banding / layout ----------

export function buildBanding<T>(
    items: T[],
    order: OrderSpec<T>
): { bandIds: string[]; bandOf: (item: T) => string } {
    const { key, projection, comparator, direction = 'asc' } = order;
    const dirMul = direction === 'asc' ? 1 : -1;

    const bandKeys = items.map((it) => safeToString(key(it)));
    const unique = Array.from(new Set(bandKeys));

    const cmp: (a: string, b: string) => number = comparator
        ? (a, b) => comparator(a, b)
        : (a, b) => {
            const pa = projection ? projection(a) : a;
            const pb = projection ? projection(b) : b;
            if (pa === undefined && pb === undefined) return 0;
            if (pa === undefined) return 1 * dirMul;
            if (pb === undefined) return -1 * dirMul;
            if (typeof pa === 'number' && typeof pb === 'number') return (pa - pb) * dirMul;
            return String(pa).localeCompare(String(pb)) * dirMul;
        };

    const bandIds = unique.sort(cmp);
    const bandOf = (it: T) => safeToString(key(it));
    return { bandIds, bandOf };
}

export function layoutByBands(
    nodes: GraphNode[],
    edges: Edge[],
    bandIds: string[],
    bandOfNode: (n: GraphNode) => string,
    options: { direction: 'LR' | 'BT'; gap?: number },
    bandOfEdge?: (e: Edge) => string | undefined
): { nodes: GraphNode[]; edges: Edge[] } {
    const gap = options.gap ?? 200;

    // Group nodes by band
    const bandToNodes = new Map<string, GraphNode[]>();
    for (const id of bandIds) bandToNodes.set(id, []);
    const idToBand = new Map<string, string>();
    for (const n of nodes) {
        const b = bandOfNode(n);
        idToBand.set(n.id, b);
        if (!bandToNodes.has(b)) bandToNodes.set(b, []);
        bandToNodes.get(b)!.push(n);
    }

    // Edges per band
    const bandToEdges = new Map<string, Edge[]>();
    for (const id of bandIds) bandToEdges.set(id, []);
    for (const e of edges) {
        if (bandOfEdge) {
            const b = bandOfEdge(e);
            if (b && bandToEdges.has(b)) bandToEdges.get(b)!.push(e);
            continue;
        }
        // default: only keep if endpoints resolve to same band
        const sBand = idToBand.get(e.source);
        const tBand = idToBand.get(e.target);
        if (sBand && tBand && sBand === tBand && bandToEdges.has(sBand)) {
            bandToEdges.get(sBand)!.push(e);
        }
    }

    // Sort so that the first band in bandIds appears visually at the bottom.
    const renderOrder = [...bandIds]; // ascending order per sort

    let yOffset = 0;
    const outputNodes: GraphNode[] = [];
    const outputEdges: Edge[] = [];

    // Render from top to bottom by iterating reversed order,
    // and assign larger offsets first so the first band ends up at the bottom.
    for (let i = renderOrder.length - 1; i >= 0; i--) {
        const band = renderOrder[i];
        const n = bandToNodes.get(band) ?? [];
        const e = bandToEdges.get(band) ?? [];

        if (n.length === 0 && e.length === 0) continue;

        const layouted = getLayoutedElements(n, e, { direction: options.direction });

        // compute band height (best-effort)
        const minY = Math.min(...layouted.nodes.map((node) => node.position.y), 0);
        const maxY = Math.max(...layouted.nodes.map((node) => node.position.y + getNodeHeight(node)), 0);
        const bandHeight = Math.max(0, maxY - minY);

        const shiftedNodes = layouted.nodes.map((node) => ({
            ...node,
            position: { x: node.position.x, y: node.position.y + yOffset }
        }));

        outputNodes.push(...shiftedNodes);
        outputEdges.push(...layouted.edges);

        yOffset += bandHeight + gap;
    }

    return { nodes: outputNodes, edges: outputEdges };
}

function getNodeHeight(node: GraphNode): number {
    const n = node as unknown as { measured?: { height?: number } };
    return n.measured?.height ?? 80;
}


