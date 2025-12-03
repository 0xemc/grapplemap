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
	import FilterPanel from './components/filter-panel.svelte';
	import IntroPane from './components/intro-pane.svelte';
	import PositionNode from './components/position-node.svelte';
	import TransitionEdge from './components/transition-edge.svelte';
	import { setGraphContext } from './graph.state.svelte';
	import { getLayoutedElements, positionToNode, transitionsToEdges } from './graph.utils';

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

	let positions = $derived(
		pipe(
			$_positions ?? [],
			filter(filterByFile),
			filter((p) => transition_positions.includes(p.title + p.modifier)),
			(arr) => mergeByKey(arr, ({ title, modifier }) => title + modifier)
		)
	);

	let edges: Edge[] = $derived(transitionsToEdges(transitions ?? []));
	let nodes = $derived(positions?.map(positionToNode));

	/** Layout on initial load */
	$effect(() => {
		const t = transitions; // establishes dependency
		if (!t || t.length === 0) return;

		setTimeout(() => onLayout('BT'), 20); // wait for DOM
	});

	function onLayout(direction: 'LR' | 'BT') {
		const layouted = getLayoutedElements(nodes, edges, { direction });

		nodes = [...layouted.nodes];
		edges = [...layouted.edges];

		fitView();
	}
</script>

<SvelteFlow
	bind:nodes
	bind:edges
	{nodeTypes}
	{edgeTypes}
	connectionLineType={ConnectionLineType.SmoothStep}
	defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
	maxZoom={1.2}
	minZoom={0.4}
>
	<FilterPanel />
	<MiniMap class="md-block hidden" />
	<Controls />
</SvelteFlow>

<TransitionModal />
<IntroPane />
