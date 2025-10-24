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
	import { Listgroup, ListgroupItem } from 'flowbite-svelte';
	import {
		getLayoutedElements,
		measureLabel,
		transitionsToEdges,
		transitionToNodes,
		type GraphNode
	} from '../graph/graph.utils';
	import TransitionEdge from '../graph/transition-edge.svelte';
	import TransitionModal from '../transition-modal/transition-modal.svelte';
	import { setGraphContext } from '../graph/graph.state.svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { page } from '$app/state';
	import { filesStore } from '$lib/stores/fileTree';

	setGraphContext();

	let transitions = liveQuery(async () => await db.transitions.toArray());
	let files = $derived($filesStore ?? []);

	// Selected file IDs control which transitions render
	let selectedFileIds = $state<Set<number>>(new Set());
	let fileQuery = $state('');

	$effect(() => {
		// Initialize selection to all files when files first load
		const f = files as any[];
		if (!f || f.length === 0) return;
		if (selectedFileIds.size === 0) {
			selectedFileIds = new Set(f.map((x) => x.id));
		}
	});

	function toggleFileSelection(id: number, checked: boolean) {
		const next = new Set(selectedFileIds);
		if (checked) next.add(id);
		else next.delete(id);
		selectedFileIds = next;
	}

	function selectAllFiles() {
		const f = files as any[];
		if (!f) return;
		selectedFileIds = new Set(f.map((x) => x.id));
	}

	function clearAllFiles() {
		selectedFileIds = new Set();
	}

	let visibleFiles = $derived(
		(files as any[]).filter((f) =>
			fileQuery ? (f.name || '').toLowerCase().includes(fileQuery.toLowerCase()) : true
		)
	);

	let filteredTransitions = $derived(
		($transitions ?? []).filter((t) => selectedFileIds.has((t as any).file_id))
	);
	let edges: Edge[] = $derived(transitionsToEdges(filteredTransitions ?? []) as unknown as Edge[]);
	let nodes = $derived(
		uniqueBy((filteredTransitions ?? []).flatMap(transitionToNodes), prop('id'))
	);

	let colorMode = $state<ColorMode>(currentTheme());
	onMount(() => observeTheme((t: Theme) => (colorMode = t)));

	const { fitView } = useSvelteFlow();
	const edgeTypes = { transition: TransitionEdge };

	/** Layout on initial load */
	$effect(() => {
		const t = filteredTransitions; // establishes dependency
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
	<Panel position="top-left">
		<div class="dark:bg-chisel-700 w-60 rounded bg-white p-2 shadow">
			<input
				type="text"
				placeholder="Filter files..."
				bind:value={fileQuery}
				class="dark:border-chisel-500 dark:bg-chisel-700 mb-2 w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
			/>
			<div class="mb-2 flex items-center justify-between gap-2">
				<Button size="xs" onclick={selectAllFiles}>All</Button>
				<Button size="xs" color="light" onclick={clearAllFiles}>None</Button>
			</div>
			<div class="max-h-64 overflow-auto pr-1">
				<Listgroup class="space-y-1">
					{#each visibleFiles as f (f.id)}
						<ListgroupItem class="flex items-center gap-2">
							<input
								type="checkbox"
								checked={selectedFileIds.has(f.id)}
								onchange={(e: any) => toggleFileSelection(f.id, e.currentTarget.checked)}
							/>
							<span class="truncate text-sm">{f.name}</span>
						</ListgroupItem>
					{/each}
				</Listgroup>
			</div>
		</div>
	</Panel>
	<MiniMap class="md-block hidden" />
	<Controls />
</SvelteFlow>

<TransitionModal />
