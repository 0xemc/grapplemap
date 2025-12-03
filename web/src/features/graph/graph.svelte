<script lang="ts">
	import { page } from '$app/state';
	import { getDbContext } from '$lib/db/context';
	import type { DBPosition } from '$lib/db/tables/positions';
	import type { DBTransition } from '$lib/db/tables/transitions';
	import { mergeByKey } from '$lib/utils/array';
	import {
		ConnectionLineType,
		Controls,
		MiniMap,
		SvelteFlow,
		useSvelteFlow,
		type Edge
	} from '@xyflow/svelte';
	import { liveQuery } from 'dexie';
	import { filter, intersection, pipe } from 'remeda';
	import TransitionModal from '../../lib/components/transition-modal/transition-modal.svelte';
	import BandOverlays from './components/band-overlays.svelte';
	import FilterPanel from './components/filter-panel.svelte';
	import IntroPane from './components/intro-pane.svelte';
	import PositionNode from './components/position-node.svelte';
	import TransitionEdge from './components/transition-edge.svelte';
	import { makeBandKeyFn, parseEdgeGroupSpec, parseNodeKeySpec, sortBands } from './graph.config';
	import {
		buildEdgesFromTransitions,
		buildNodesFromPositions,
		buildNodesFromTransitions
	} from './graph.grouping';
	import { layoutWithOrdering } from './graph.layout';
	import { setGraphContext } from './graph.state.svelte';
	import { getLayoutedElements, type GraphNode } from './graph.utils';

	setGraphContext();

	const db = getDbContext();
	const { fitView } = useSvelteFlow();
	const edgeTypes = { transition: TransitionEdge };
	const nodeTypes = { position: PositionNode };
	let fileIds = $derived(page.url.searchParams.getAll('file').map(Number));
	let tagIds = $derived(page.url.searchParams.getAll('tag'));
	let _transitions = liveQuery(async () => await db.transitions.toArray());
	let _positions = liveQuery(async () => await db.positions.toArray());

	const filterByTag = (t: DBTransition) =>
		tagIds.length && t.tags ? !!intersection(tagIds, t.tags ?? []).length : true;

	const filterByFile = (t: DBTransition | DBPosition) =>
		fileIds?.length ? fileIds?.includes(t.file_id) : true;

	let transitions = $derived(pipe($_transitions ?? [], filter(filterByFile), filter(filterByTag)));
	let transition_positions = $derived(
		transitions.flatMap(({ from, fromTag, to, toTag }) => [from + fromTag, to + toTag])
	);

	// ---------------- Simplified grouping/ordering: single group-by tag ----------------
	const groupTag = $derived(page.url.searchParams.get('groupTag') ?? '');
	const orderKey = $derived(groupTag ? `tag:${groupTag}` : 'none');
	const orderType = 'lex' as const;
	const orderDir = 'asc' as const;

	// Base positions filtered only by file, merged by position id
	let positions_by_file = $derived(
		pipe($_positions ?? [], filter(filterByFile), (arr) =>
			mergeByKey(arr, ({ title, modifier }) => title + modifier)
		)
	);
	// Collate positions with transitions ONLY when not grouping by a tag
	let positions = $derived(
		!groupTag
			? pipe(
					positions_by_file ?? [],
					filter((p) => transition_positions.includes(p.title + p.modifier))
				)
			: (positions_by_file ?? [])
	);

	// moved to graph.config.ts

	const nodeKeySpec = $derived(
		parseNodeKeySpec(groupTag ? `position,tag:${groupTag}` : 'position')
	);

	// When grouping by a tag, derive nodes from transitions to preserve tag info
	const useTransitionsForNodes = $derived(!!groupTag);

	// Use all file-filtered positions for metadata so nodes built from transitions can pick up tags
	const posTagMap = $derived(
		new Map((positions_by_file ?? []).map((p) => [`${p.title}${p.modifier ?? ''}`, p.tags ?? []]))
	);

	let nodes: GraphNode[] = $derived(
		useTransitionsForNodes
			? buildNodesFromTransitions(transitions ?? [], nodeKeySpec, posTagMap)
			: buildNodesFromPositions(positions ?? [], nodeKeySpec)
	);
	let edges: Edge[] = $derived(
		buildEdgesFromTransitions(
			transitions ?? [],
			nodeKeySpec,
			groupTag ? parseEdgeGroupSpec(`tag:${groupTag}`) : []
		)
	);

	/** Layout on initial load */
	$effect(() => {
		const t = transitions; // establishes dependency
		if (!t || t.length === 0) return;

		setTimeout(() => onLayout('BT', true), 20); // wait for DOM
	});

	// Re-layout when grouping/ordering params change (avoid fitView so user interactions aren't reset)
	$effect(() => {
		// establish deps only on simplified params
		const _gt = groupTag;
		const _ok = orderKey;
		setTimeout(() => onLayout('BT', false), 16);
	});

	function onLayout(direction: 'LR' | 'BT', doFit: boolean = false) {
		// Band ordering (optional)
		const _orderKey = orderKey;
		const _orderType = orderType;
		const _orderDir = orderDir;

		// Build a band key accessor for nodes if requested
		if (_orderKey && _orderKey !== 'none') {
			const bandKeyFn = makeBandKeyFn(_orderKey);
			const seenBands = Array.from(new Set(nodes.map((n) => bandKeyFn(n)))) as string[];
			// Default to numeric ordering if band labels contain digits
			const hasDigits = seenBands.some((b) => /\d/.test(String(b)));
			const usedOrderType = hasDigits ? 'num' : _orderType;
			const sortedBands = sortBands(seenBands, usedOrderType, _orderDir);

			// If there are 0 or 1 bands, use the default layout for performance
			if (sortedBands.length <= 1) {
				const layoutedSingle = getLayoutedElements(nodes, edges, { direction });
				nodes = [...layoutedSingle.nodes];
				edges = [...layoutedSingle.edges];
				if (doFit) fitView();
				return;
			}

			const layouted = layoutWithOrdering(
				nodes,
				edges,
				{ orderKey: _orderKey, orderType: usedOrderType, orderDir: _orderDir, direction },
				bandKeyFn,
				sortedBands
			);

			// Build band label nodes based on laid out nodes
			const bandExtents = new Map<
				string,
				{ minX: number; maxX: number; minY: number; maxY: number }
			>();
			for (const n of layouted.nodes) {
				const b = bandKeyFn(n as any);
				if (!b) continue;
				const e = bandExtents.get(b) ?? {
					minX: Number.POSITIVE_INFINITY,
					maxX: Number.NEGATIVE_INFINITY,
					minY: Number.POSITIVE_INFINITY,
					maxY: Number.NEGATIVE_INFINITY
				};
				e.minX = Math.min(e.minX, n.position.x);
				e.maxX = Math.max(e.maxX, n.position.x + ((n as any).measured?.width ?? 120));
				e.minY = Math.min(e.minY, n.position.y);
				e.maxY = Math.max(e.maxY, n.position.y + ((n as any).measured?.height ?? 60));
				bandExtents.set(b, e);
			}
			nodes = [...layouted.nodes];
			edges = [...layouted.edges];
			if (doFit) fitView();
			return;
		}

		// Default layout
		const layouted = getLayoutedElements(nodes, edges, { direction });

		nodes = [...layouted.nodes];
		edges = [...layouted.edges];

		if (doFit) fitView();
	}
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	{nodeTypes}
	{edgeTypes}
	connectionLineType={ConnectionLineType.SmoothStep}
	defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
	maxZoom={1.8}
	minZoom={0.4}
>
	<FilterPanel />
	<MiniMap class="md-block hidden" />
	<Controls />
	<!-- Background band overlays -->
	{#if groupTag}
		<BandOverlays {nodes} {edges} orderKey={`tag:${groupTag}`} />
	{/if}
</SvelteFlow>

<TransitionModal />
<IntroPane />
