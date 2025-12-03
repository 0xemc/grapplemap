import type { Edge } from '@xyflow/svelte';
import { layoutByBands, findTag } from './graph.grouping';
import type { GraphNode } from './graph.utils';
import { getLayoutedElements } from './graph.utils';

export type OrderParams = {
	orderKey: string;
	orderType: 'num' | 'lex';
	orderDir: 'asc' | 'desc';
	direction: 'LR' | 'BT';
};

export function layoutWithOrdering(
	nodes: GraphNode[],
	edges: Edge[],
	params: OrderParams,
	bandKeyFn: (n: GraphNode) => string,
	sortedBands: string[]
): { nodes: GraphNode[]; edges: Edge[] } {
	// Fast path
	if (!params.orderKey || params.orderKey === 'none' || sortedBands.length <= 1) {
		return getLayoutedElements(nodes, edges, { direction: params.direction });
	}

	// If ordering is tag-based, group edges by tag value to avoid dropping them
	const bandOfEdge =
		params.orderKey.startsWith('tag:') &&
		((e: Edge) => {
			const tagName = params.orderKey.slice(4);
			const ts = (e as any)?.data?.transitions ?? [];
			const t0 = ts[0];
			return findTag(t0?.tags, tagName);
		});

	return layoutByBands(
		nodes,
		edges,
		sortedBands,
		bandKeyFn,
		{ direction: params.direction },
		typeof bandOfEdge === 'function' ? bandOfEdge : undefined
	);
}


