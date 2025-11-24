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
	import {
		getLayoutedElements,
		positionToNode,
		transitionsToEdges,
		transitionToNodes
	} from '../graph/graph.utils';
	import TransitionEdge from '../graph/transition-edge.svelte';
	import TransitionModal from '../transition-modal/transition-modal.svelte';
	import { setGraphContext } from '../graph/graph.state.svelte';
	import { liveQuery } from 'dexie';
	import { getDbContext } from '$lib/db/context';
	import FileSelect from '../file-select/file-select.svelte';
	import { Button } from 'flowbite-svelte';
	import { AdjustmentsHorizontalOutline, MinusOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	import { setParam } from '$lib/utils/params';
	import MultiSelect from '../multi-select.svelte';
	import PositionNode from './position-node.svelte';
	import type { DBTransition } from '$lib/db/tables/transitions';
	import { getSharedModeContext } from '$lib/share/context';
	import { compact, mergeByKey } from '$lib/utils/array';
	import type { DBPosition } from '$lib/db/tables/positions';
	import { cursorSyntaxLeft } from '@codemirror/commands';

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
			(arr) => mergeByKey(({ title, modifier }) => title + modifier, arr)
		)
	);

	let edges: Edge[] = $derived(transitionsToEdges(transitions ?? []) as unknown as Edge[]);
	let nodes = $derived(uniqueBy((transitions ?? []).flatMap(transitionToNodes), prop('id')));
	$effect(() => {
		console.log('positions', positions);
		console.log('nodes', nodes);
		console.log(positions?.map(positionToNode));
	});

	// let edges: Edge[] = $derived(transitionsToEdges(transitions ?? []));
	// let nodes = $derived(positions?.map(positionToNode));

	let colorMode = $state<ColorMode>(currentTheme());

	// Filters panel state (used for mobile only). Desktop is always visible.
	let filtersOpen = $state<boolean>(false);
	let desktopFiltersOpen = $state<boolean>(true);

	onMount(() => {
		observeTheme((t: Theme) => (colorMode = t));
	});

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
		<!-- Toggle button visible only when collapsed for current breakpoint -->
		<Button
			size="sm"
			color="light"
			onclick={() => {
				filtersOpen = true;
				desktopFiltersOpen = true;
			}}
			class={`${filtersOpen ? 'hidden' : 'inline-flex'} ${desktopFiltersOpen ? 'md:hidden' : 'md:inline-flex'} border-chisel-100 rounded border bg-white p-2 shadow`}
		>
			<AdjustmentsHorizontalOutline class="h-6 w-6 shrink-0" />
		</Button>

		<!-- Content box: visible on mobile when filtersOpen, on desktop when desktopFiltersOpen -->
		<div
			class={`${filtersOpen ? 'flex' : 'hidden'} ${desktopFiltersOpen ? 'md:flex' : 'md:hidden'} shadow-nondark:bg-chisel-700 border-chisel-100 w-60 flex-col gap-2 rounded-lg border bg-white p-2 shadow`}
		>
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold">Filters</span>
				<Button
					size="xs"
					color="light"
					onclick={() => {
						filtersOpen = false;
						desktopFiltersOpen = false;
					}}
					class="p-1"
				>
					<MinusOutline class="h-4 w-4" />
				</Button>
			</div>
			{#if !sharedMode}
				<FileSelect files={$files} onChange={onFilesChange} initial={fileIds} />
			{/if}
			<MultiSelect
				items={compact(transition_tags).map((t) => ({ value: t, name: t }))}
				label="Tags"
				searchPlaceholder="Select tags..."
				onChange={onTagChange}
				initial={tagIds}
			/>
		</div>
	</Panel>

	<MiniMap class="md-block hidden" />
	<Controls />
</SvelteFlow>

<TransitionModal />
