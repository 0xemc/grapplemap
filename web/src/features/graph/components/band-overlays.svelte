<script lang="ts">
	import { ViewportPortal } from '@xyflow/svelte';
	import type { GraphNode } from '../graph.utils';
	import { makeBandKeyFn } from '../graph.config';

	type Props = {
		nodes: GraphNode[];
		orderKey: string;
		padding?: number;
	};
	let { nodes, orderKey, padding = 32 }: Props = $props();

	// Compute band extents in flow coordinates
	type Extent = { minX: number; minY: number; maxX: number; maxY: number; label: string };
	let extents: Extent[] = $state([]);

	$effect(() => {
		if (!orderKey || orderKey === 'none') {
			extents = [];
			return;
		}
		const bandKey = makeBandKeyFn(orderKey);
		const map = new Map<string, Extent>();
		for (const n of nodes ?? []) {
			// ignore any non-position helper nodes if present
			if ((n as any).type && (n as any).type !== 'position') continue;
			const key = bandKey(n as any);
			if (!key) continue;
			const w = (n as any).measured?.width ?? 120;
			const h = (n as any).measured?.height ?? 60;
			const e = map.get(key) ?? {
				minX: Number.POSITIVE_INFINITY,
				minY: Number.POSITIVE_INFINITY,
				maxX: Number.NEGATIVE_INFINITY,
				maxY: Number.NEGATIVE_INFINITY,
				label: key
			};
			e.minX = Math.min(e.minX, n.position.x);
			e.minY = Math.min(e.minY, n.position.y);
			e.maxX = Math.max(e.maxX, n.position.x + w);
			e.maxY = Math.max(e.maxY, n.position.y + h);
			map.set(key, e);
		}
		extents = Array.from(map.values());
	});
</script>

<ViewportPortal target="back">
	<div class="pointer-events-none absolute left-0 top-0 h-0 w-0">
		{#each extents as e (e.label)}
			<div
				class="absolute rounded border border-dashed border-gray-300"
				style={`left:${e.minX - padding}px; top:${e.minY - padding}px; width:${e.maxX - e.minX + padding * 2}px; height:${e.maxY - e.minY + padding * 2}px;`}
			>
				<span class="absolute left-2 top-1 rounded bg-white px-1 text-[10px] text-gray-500">
					{e.label}
				</span>
			</div>
		{/each}
	</div>
</ViewportPortal>
