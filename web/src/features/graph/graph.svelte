<script lang="ts">
	import {
		ConnectionLineType,
		Controls,
		MiniMap,
		SvelteFlow,
		useSvelteFlow,
		Panel,
		type ColorMode,
		type Edge
	} from '@xyflow/svelte';

	import { filter, intersection, pipe, prop, unique, uniqueBy, purry } from 'remeda';
	import { currentTheme, observeTheme, type Theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';
	import { getLayoutedElements, type GraphNode } from './graph.utils';
	import { parseNodeKeySpec, parseEdgeGroupSpec, makeBandKeyFn, sortBands } from './graph.config';
	import { layoutWithOrdering } from './graph.layout';
	import {
		buildEdgesFromTransitions,
		buildNodesFromPositions,
		buildNodesFromTransitions,
		type GroupKeySpec,
		numericPart,
		fileIdP,
		fileIdT,
		posTag,
		trTag,
		positionId,
		layoutByBands,
		findTag
	} from './graph.grouping';
	import TransitionEdge from './components/transition-edge.svelte';
	import BandOverlays from './components/band-overlays.svelte';
	import TransitionModal from '../../lib/components/transition-modal/transition-modal.svelte';
	import { setGraphContext } from './graph.state.svelte';
	import { liveQuery } from 'dexie';
	import { getDbContext } from '$lib/db/context';
	import FileSelect from '../../lib/components/file-select/file-select.svelte';
	import { Button } from 'flowbite-svelte';
	import { AdjustmentsHorizontalOutline, MinusOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	import { setParam } from '$lib/utils/params';
	import MultiSelect from '../../lib/components/multi-select.svelte';
	import PositionNode from './components/position-node.svelte';
	import type { DBTransition } from '$lib/db/tables/transitions';
	import { getSharedModeContext } from '$lib/share/context';
	import { compact, mergeByKey } from '$lib/utils/array';
	import type { DBPosition } from '$lib/db/tables/positions';
	import { sweep } from '$lib/db/utils';
	import IntroPane from './components/intro-pane.svelte';

	setGraphContext();
	const sharedMode = getSharedModeContext();
	const dbInst = getDbContext();
	const { fitView } = useSvelteFlow();
	const edgeTypes = { transition: TransitionEdge };
	const nodeTypes = { position: PositionNode };
	let fileIds = $derived($page.url.searchParams.getAll('file').map(Number));
	let tagIds = $derived($page.url.searchParams.getAll('tag'));
	let files = liveQuery(async () => await dbInst.files.toArray());
	let _transitions = liveQuery(async () => await dbInst.transitions.toArray());
	let _positions = liveQuery(async () => await dbInst.positions.toArray());

	let transition_tags = $derived(
		unique($_transitions?.flatMap((t) => t.tags).filter((t) => !t?.includes('url:')) ?? [])
	);

	const filterByTag = (t: DBTransition) =>
		tagIds.length && t.tags ? !!intersection(tagIds, t.tags ?? []).length : true;

	const filterByFile = (t: DBTransition | DBPosition) =>
		fileIds?.length ? fileIds?.includes(t.file_id) : true;

	let transitions = $derived(pipe($_transitions ?? [], filter(filterByFile), filter(filterByTag)));
	let transition_positions = $derived(
		transitions.flatMap(({ from, fromTag, to, toTag }) => [from + fromTag, to + toTag])
	);

	let positions = $derived(
		pipe(
			$_positions ?? [],
			filter(filterByFile),
			filter((p) => transition_positions.includes(p.title + p.modifier)),
			(arr) => mergeByKey(arr, ({ title, modifier }) => title + modifier)
		)
	);

	// ---------------- Grouping/Ordering configuration (URL params) ----------------
	const rawGroupNodes = $derived($page.url.searchParams.get('groupNodes') ?? 'position');
	const rawGroupEdges = $derived($page.url.searchParams.get('groupEdges') ?? '');
	const rawOrderKey = $derived($page.url.searchParams.get('orderKey') ?? 'none');
	const rawOrderType = $derived(
		($page.url.searchParams.get('orderType') as 'num' | 'lex') ?? 'lex'
	);
	const rawOrderDir = $derived(($page.url.searchParams.get('orderDir') as 'asc' | 'desc') ?? 'asc');

	// moved to graph.config.ts

	const nodeKeySpec = $derived(parseNodeKeySpec(rawGroupNodes));
	const edgeGroupSpec = $derived(parseEdgeGroupSpec(rawGroupEdges));

	// When nodeKeySpec includes any tag accessor, derive nodes from transitions to preserve tags
	const nodeSpecIncludesTag = $derived(
		rawGroupNodes.split(',').some((p) => p.trim().startsWith('tag:'))
	);
	const orderIsTag = $derived(rawOrderKey.startsWith('tag:'));
	const useTransitionsForNodes = $derived(
		nodeSpecIncludesTag || rawGroupNodes !== 'position' || orderIsTag
	);

	let nodes: GraphNode[] = $derived(
		useTransitionsForNodes
			? buildNodesFromTransitions(transitions ?? [], nodeKeySpec)
			: buildNodesFromPositions(positions ?? [], nodeKeySpec)
	);
	let edges: Edge[] = $derived(
		buildEdgesFromTransitions(transitions ?? [], nodeKeySpec, edgeGroupSpec)
	);

	let colorMode = $state<ColorMode>(currentTheme());

	// Filters panel state (used for mobile only). Desktop is always visible.
	let filtersOpen = $state<boolean>(false);
	let desktopFiltersOpen = $state<boolean>(true);

	onMount(() => {
		observeTheme((t: Theme) => (colorMode = t));
	});

	$effect(() => {
		console.log('positions', positions);
		console.log('nodes', nodes);
	});

	/** Layout on initial load */
	$effect(() => {
		const t = transitions; // establishes dependency
		if (!t || t.length === 0) return;

		setTimeout(() => onLayout('BT', true), 20); // wait for DOM
	});

	// Re-layout when grouping/ordering params change (avoid fitView so user interactions aren't reset)
	$effect(() => {
		// establish deps only on params
		const _gn = rawGroupNodes;
		const _ge = rawGroupEdges;
		const _ok = rawOrderKey;
		const _ot = rawOrderType;
		const _od = rawOrderDir;
		setTimeout(() => onLayout('BT', false), 16);
	});

	function onLayout(direction: 'LR' | 'BT', doFit: boolean = false) {
		// Band ordering (optional)
		const orderKey = rawOrderKey;
		const orderType = rawOrderType;
		const orderDir = rawOrderDir;

		// Build a band key accessor for nodes if requested
		if (orderKey && orderKey !== 'none') {
			const bandKeyFn = makeBandKeyFn(orderKey);
			const seenBands = Array.from(new Set(nodes.map((n) => bandKeyFn(n)))) as string[];
			const sortedBands = sortBands(seenBands, orderType, orderDir);

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
				{ orderKey, orderType, orderDir, direction },
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

	function onFilesChange(ids: number[]) {
		setParam('file', ids.map(String));
	}

	function onTagChange(tags: string[]) {
		setParam('tag', tags);
	}
	// // Focus edge from query param when available and data is ready
	// $effect(() => {
	// 	const id = page.url.searchParams.get('transition');
	// 	if (!id) return;
	// 	if (!edges?.length || !nodes?.length) return;

	// 	const isActive = (e: Edge) => e.data?.transitions?.some((t) => t.title === id) ?? false;

	// 	// Only update if selection state differs
	// 	const needsUpdate = edges.some((e) => (e.selected ?? false) !== isActive(e));
	// 	if (needsUpdate) {
	// 		edges = edges.map((e) => ({ ...e, selected: isActive(e) }));
	// 	}

	// 	const activeEdge = edges.find(isActive);
	// 	if (!activeEdge) return;

	// 	const endpoints = nodes.filter((n) => n.id === activeEdge.source || n.id === activeEdge.target);
	// 	if (endpoints.length) {
	// 		try {
	// 			fitView({ nodes: endpoints, padding: 0.2 });
	// 		} catch {
	// 			fitView();
	// 		}
	// 	}
	// });
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	{nodeTypes}
	{edgeTypes}
	{colorMode}
	connectionLineType={ConnectionLineType.SmoothStep}
	defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
	maxZoom={1.2}
	minZoom={0.4}
>
	<!-- <Panel position="top-right">
		<ButtonGroup>
			<Button onclick={() => onLayout('LR')} class="">→ horizontal</Button>
			<Button onclick={() => onLayout('BT')} class="">↑ vertical</Button>
		</ButtonGroup>
	</Panel> -->

	<Panel position="top-right" class="border-0 bg-transparent p-0 shadow-none">
		<!-- Filters Panel -->
		<!-- Using extracted component -->
		<!-- static import for best type checking -->
		{#await import('./components/filters-panel.svelte') then Mod}
			<Mod.default
				sharedMode={!!sharedMode}
				files={$files}
				{fileIds}
				transitionTags={(transition_tags ?? []).filter((t) => typeof t === 'string') as string[]}
				tagIds={(tagIds ?? []).filter((t) => typeof t === 'string') as string[]}
				{onFilesChange}
				{onTagChange}
				{rawGroupNodes}
				{rawGroupEdges}
				{rawOrderKey}
				{rawOrderType}
				{rawOrderDir}
				{setParam}
			/>
		{/await}
	</Panel>

	<MiniMap class="md-block hidden" />
	<Controls />
	<!-- Background band overlays -->
	{#if rawOrderKey !== 'none'}
		<BandOverlays {nodes} orderKey={rawOrderKey} />
	{/if}
</SvelteFlow>

<TransitionModal />
<IntroPane />
