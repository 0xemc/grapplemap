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
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { getLayoutedElements, transitionsToEdges, transitionToNodes } from '../graph/graph.utils';
	import TransitionEdge from '../graph/transition-edge.svelte';
	import TransitionModal from '../transition-modal/transition-modal.svelte';
	import { setGraphContext } from '../graph/graph.state.svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import FileSelect from '../file-select/file-select.svelte';

	import { page } from '$app/state';
	import { setParam } from '$lib/utils/params';

	setGraphContext();

	const { fitView } = useSvelteFlow();
	const edgeTypes = { transition: TransitionEdge };
	let fileIds = $derived(page.url.searchParams.getAll('file').map(Number));
	let files = liveQuery(async () => await db.files.toArray());
	let _transitions = liveQuery(async () => await db.transitions.toArray());
	let transitions = $derived(
		$_transitions?.filter((t) => (fileIds?.length ? fileIds?.includes(t.file_id) : true))
	);

	let edges: Edge[] = $derived(transitionsToEdges(transitions ?? []) as unknown as Edge[]);
	let nodes = $derived(uniqueBy((transitions ?? []).flatMap(transitionToNodes), prop('id')));
	let colorMode = $state<ColorMode>(currentTheme());

	onMount(() => observeTheme((t: Theme) => (colorMode = t)));

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

	function onFilesChange(ids: number[]) {
		setParam('file', ids.map(String));
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
	<Panel position="top-left" class="shadow-none">
		<FileSelect files={$files} onChange={onFilesChange} />
	</Panel>
	<MiniMap class="md-block hidden" />
	<Controls />
</SvelteFlow>

<TransitionModal />
