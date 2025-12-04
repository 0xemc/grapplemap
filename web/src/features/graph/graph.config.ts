import type { DBPosition } from '$lib/db/tables/positions';
import type { DBTransition } from '$lib/db/tables/transitions';
import type { GroupKeySpec } from './graph.grouping';
import {
	fileIdP,
	fileIdT,
	findTag,
	numericPart,
	positionId,
	posTag,
	trTag
} from './graph.grouping';
import type { GraphNode } from './graph.utils';

export function parseNodeKeySpec(spec: string): GroupKeySpec<DBPosition> {
	const parts = spec
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const accessors: GroupKeySpec<DBPosition> = [];
	for (const p of parts) {
		if (p === 'position') accessors.push(positionId);
		else if (p === 'file') accessors.push(fileIdP);
		else if (p.startsWith('tag:')) accessors.push(posTag(p.slice(4)));
	}
	return accessors.length ? accessors : [positionId];
}

export function parseEdgeGroupSpec(spec: string): GroupKeySpec<DBTransition> {
	const parts = spec
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const accessors: GroupKeySpec<DBTransition> = [];
	for (const p of parts) {
		if (p === 'file') accessors.push(fileIdT);
		else if (p.startsWith('tag:')) accessors.push(trTag(p.slice(4)));
	}
	return accessors;
}

export function makeBandKeyFn(orderKey: string): (n: GraphNode) => string {
	return (n: GraphNode) => {
		if (orderKey.startsWith('tag:')) {
			const tagName = orderKey.slice(4);
			const val = findTag(n?.data?.tags, tagName);
			return String(val ?? '');
		}
		return String(n?.data?.label ?? '');
	};
}

export function sortBands(
	bands: string[],
	orderType: 'num' | 'lex',
	direction: 'asc' | 'desc'
): string[] {
	const dirMul = direction === 'asc' ? 1 : -1;
	const proj =
		orderType === 'num' ? (v: unknown) => numericPart(v) ?? Number.POSITIVE_INFINITY : undefined;
	return [...bands].sort((a, b) => {
		if (proj) {
			const aN = proj(a);
			const bN = proj(b);
			const cmp =
				typeof aN === 'number' && typeof bN === 'number'
					? aN - bN
					: String(a).localeCompare(String(b));
			return dirMul * cmp;
		}
		return dirMul * String(a).localeCompare(String(b));
	});
}
