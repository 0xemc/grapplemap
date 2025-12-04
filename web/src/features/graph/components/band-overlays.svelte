<script lang="ts">
	import { ViewportPortal } from '@xyflow/svelte';
	import type { GraphNode } from '../graph.utils';
	import { SELF_LOOP_TOP_PAD } from '../graph.utils';
	import { makeBandKeyFn } from '../graph.config';

	type Props = {
		nodes: GraphNode[];
		edges?: import('@xyflow/svelte').Edge[];
		orderKey: string;
		padding?: number;
	};
	let { nodes, edges = [], orderKey, padding = 42 }: Props = $props();

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
		// Expand extents by self-loop label boxes
		for (const e of edges ?? []) {
			if (e.source !== e.target) continue;
			const src = nodes.find((n) => n.id === e.source);
			if (!src) continue;
			const key = bandKey(src as any);
			if (!key) continue;
			const loopPadY = SELF_LOOP_TOP_PAD + 16; // add extra top spacing
			const labelBoxWidth = ((e.data as any)?.__boxWidth as number) ?? 200;
			const labelBoxHeight = ((e.data as any)?.__boxHeight as number) ?? 60;
			const srcW = (src as any).measured?.width ?? 120;
			const srcH = (src as any).measured?.height ?? 60;
			const ext = map.get(key) ?? {
				minX: Number.POSITIVE_INFINITY,
				minY: Number.POSITIVE_INFINITY,
				maxX: Number.NEGATIVE_INFINITY,
				maxY: Number.NEGATIVE_INFINITY,
				label: key
			};
			// Loop drawn to the right and above; expand to the right by label width
			// and up to the top of the label box center minus half its height
			const centerY = src.position.y + srcH / 2;
			const labelCenterY = centerY - SELF_LOOP_TOP_PAD;
			const labelTopY = labelCenterY - labelBoxHeight / 2;
			ext.minY = Math.min(ext.minY, labelTopY - 8); // tiny breathing room
			ext.maxX = Math.max(ext.maxX, src.position.x + srcW + labelBoxWidth);
			map.set(key, ext);
		}
		extents = Array.from(map.values());
	});
</script>

<ViewportPortal target="back">
	<div class="pointer-events-none absolute top-0 left-0 h-0 w-0">
		{#each extents as e (e.label)}
			<div
				class="absolute rounded border border-dashed border-gray-300"
				style={`left:${e.minX - padding}px; top:${e.minY - padding}px; width:${e.maxX - e.minX + padding * 2}px; height:${e.maxY - e.minY + padding * 2}px;`}
			>
				<span class="absolute top-1 left-2 rounded bg-white px-1 text-[10px] text-gray-500">
					{e.label}
				</span>
			</div>
		{/each}
	</div>
</ViewportPortal>
