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

	import { prop, uniqueBy } from 'remeda';
	import { currentTheme, observeTheme, type Theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';
	import { Button, ButtonGroup, Modal, P } from 'flowbite-svelte';
	import {
		getLayoutedElements,
		measureLabel,
		transitionsToEdges,
		transitionToNodes,
		type GraphNode
	} from './graph.utils';
	import TransitionEdge from './transition-edge.svelte';
	import TransitionModal from './transition-modal.svelte';
	import { setGraphContext } from './graph.state.svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { page } from '$app/state';

	setGraphContext();

	let transitions = liveQuery(async () => await db.transitions.toArray());

	let edges = $derived(transitionsToEdges($transitions ?? []));
	let nodes = $derived(uniqueBy(($transitions ?? []).flatMap(transitionToNodes), prop('id')));

	let colorMode = $state<ColorMode>(currentTheme());
	onMount(() => observeTheme((t: Theme) => (colorMode = t)));

	const { fitView } = useSvelteFlow();
	const edgeTypes = { transition: TransitionEdge };

	/** Layout on initial load */
	$effect(() => {
		const t = $transitions; // establishes dependency
		if (!t || t.length === 0) return;

		setTimeout(() => onLayout('BT'), 20); // wait for DOM
	});

	function onLayout(direction: 'LR' | 'BT') {
		const layouted = getLayoutedElements(nodes, edges, { direction });

		nodes = [...layouted.nodes];
		edges = [...layouted.edges];

		fitView();
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
	{edgeTypes}
	{colorMode}
	connectionLineType={ConnectionLineType.SmoothStep}
	defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
	maxZoom={1.2}
	minZoom={0.4}
>
	<Panel position="top-right">
		<ButtonGroup>
			<Button onclick={() => onLayout('LR')} class="">→ horizontal</Button>
			<Button onclick={() => onLayout('BT')} class="">↑ vertical</Button>
		</ButtonGroup>
	</Panel>
	<Panel position="top-left"></Panel>
	<MiniMap class="md-block hidden" />
	<Controls />
</SvelteFlow>

<TransitionModal />
