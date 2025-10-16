<script lang="ts">
	import {
		ConnectionLineType,
		Controls,
		MiniMap,
		SvelteFlow,
		useSvelteFlow,
		Panel,
		type ColorMode
	} from '@xyflow/svelte';
	import * as Dagre from '@dagrejs/dagre';
	import { isNonNullish, prop, uniqueBy } from 'remeda';
	import { currentTheme, observeTheme, type Theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';
	import { filesStore } from '$lib/stores/fileTree';
	import { type FileT } from '$lib/db/fileTree';
	import { type Transition } from '@lang/types';
	import { parse } from '@lang/parse';
	import * as ohm from 'ohm-js';
	import transitionRecipe from '@lang/recipes/transition.json';
	import { Button, ButtonGroup, Modal, P } from 'flowbite-svelte';
	import { transitionToEdge, transitionToNodes } from './utils';
	import TransitionEdge from './TransitionEdge.svelte';
	import TransitionModal from './TransitionModal.svelte';
	import { setGraphContext } from './state.svelte';

	let nodes = $state.raw([]);
	let edges = $state.raw([]);
	let colorMode = $state<ColorMode>(currentTheme());
	let files = $state<FileT[] | null>(null);

	const { fitView } = useSvelteFlow();
	const edgeTypes = { transition: TransitionEdge };
	const grammar = ohm.makeRecipe(transitionRecipe);

	setGraphContext();

	onMount(() => observeTheme((t: Theme) => (colorMode = t)));

	// Subscribe on mount; cleanup on teardown
	$effect(() => {
		const unsub = filesStore.subscribe((v) => {
			files = v;
		});
		return () => unsub();
	});

	$effect(() => {
		const transitions = files
			?.map(prop('content'))
			.map((content) => parse(grammar, content ?? ''))
			.flatMap((res) => res?.transitions)
			.filter(isNonNullish);

		edges = (transitions ?? [])?.map(transitionToEdge);
		nodes = uniqueBy(transitions?.flatMap(transitionToNodes) ?? [], prop('id'));
		// @todo Unsure why we need this slight delay for layout to work correctly
		setTimeout(() => onLayout('LR'), 20);
	});

	function measureLabel(text: string): { width: number; height: number } {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		// keep this in sync with your EdgeLabel styles
		ctx.font = '14px Inter, system-ui, sans-serif';
		const w = Math.ceil(ctx.measureText(text).width);
		// padding + line height roughly matching your EdgeLabel class
		return { width: w + 20, height: 28 };
	}

	function getLayoutedElements(nodes, edges, options) {
		const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
		g.setGraph({ rankdir: options.direction, ranksep: 140, nodesep: 100, edgesep: 100 });

		edges.forEach((edge) => {
			const { width: labelWidth, height: labelHeight } = measureLabel(edge.label); // measure your label if you render one
			g.setEdge(edge.source, edge.target, {
				// If you have a label string you can pass it too; the box is what reserves space:
				label: edge.label ?? '',
				width: labelWidth,
				height: labelHeight,
				labelpos: 'c', // "l" | "r" | "c"
				minlen: edge.minlen ?? 1, // >1 forces extra rank gaps for this edge
				weight: edge.weight ?? 1 // crossing minimization priority
			});
		});

		nodes.forEach((node) =>
			g.setNode(node.id, {
				...node,
				width: node.measured?.width ?? 0,
				height: node.measured?.height ?? 0
			})
		);

		Dagre.layout(g);

		return {
			nodes: nodes.map((node) => {
				const position = g.node(node.id);
				// We are shifting the dagre node position (anchor=center center) to the top left
				// so it matches the Svelte Flow node anchor point (top left).
				const x = position.x - (node.measured?.width ?? 0) / 2;
				const y = position.y - (node.measured?.height ?? 0) / 2;

				return {
					...node,
					position: { x, y },
					sourcePosition: options.direction === 'LR' ? 'right' : 'bottom',
					targetPosition: options.direction === 'LR' ? 'left' : 'top'
				};
			}),
			edges
		};
	}

	function onLayout(direction) {
		const layouted = getLayoutedElements(nodes, edges, { direction });

		nodes = [...layouted.nodes];
		edges = [...layouted.edges];

		fitView();
	}
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
			<Button onclick={() => onLayout('TB')} class="">↓ vertical</Button>
		</ButtonGroup>
	</Panel>
	<MiniMap class="md-block hidden" />
	<Controls />
</SvelteFlow>

<TransitionModal />
