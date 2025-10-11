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
	import { prop, uniqueBy } from 'remeda';
	import TransitionNode from '../../lib/components/TransitionNode.svelte';
	import { currentTheme, observeTheme, type Theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';
	import { filesStore } from '$lib/stores/fileTree';
	import { type FileT } from '$lib/db/fileTree';
	import { type Transition } from '@lang/types';
	import { transition } from '@lang/operations';
	const nodeTypes = { textUpdater: TransitionNode };
	let nodes = $state.raw([{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } }]);
	let edges = $state.raw([{ id: 'e1-2', source: 'node-1', target: '2' }]);

	let colorMode = $state<ColorMode>(currentTheme());
	onMount(() => observeTheme((t: Theme) => (colorMode = t)));

	let files = $state<FileT[] | null>(null);
	let transitions = $state<Transition[] | undefined>(undefined);

	// Subscribe on mount; cleanup on teardown
	$effect(() => {
		const unsub = filesStore.subscribe((v) => {
			files = v;
		});
		return () => unsub();
	});

	$effect(() => {
		const promises = files?.map((f) => f.content ?? '').map(parseOnServer);

		Promise.all(promises ?? []).then((res) => {
			console.log(res);
			const transitions = res.flatMap((r) => r.data);
			console.log(transitions);
			nodes = uniqueBy(transitions.flatMap(transitionToNodes), prop('id'));
			edges = transitions.map(transitionToEdge);
			// @todo Unsure why we need this slight delay for layout to work correctly
			setTimeout(() => onLayout('LR'), 20);
		});
	});

	$effect(() => console.log(transitions));

	function transitionToEdge(tr: Transition) {
		return { id: tr.title, source: tr.from, target: tr.to, animated: true, label: tr.title };
	}

	function transitionToNodes(tr: Transition) {
		return [
			{
				id: tr.from,
				position: { x: 0, y: 0 },
				data: { label: tr.from }
			},
			{
				id: tr.to,
				position: { x: 0, y: 0 },
				data: { label: tr.to }
			}
		];
	}

	async function parseOnServer(text: string) {
		const r = await fetch('/api/parse', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text })
		});
		return r.json();
	}

	const { fitView } = useSvelteFlow();

	function getLayoutedElements(nodes, edges, options) {
		const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
		g.setGraph({ rankdir: options.direction, ranksep: 140, nodesep: 100, edgesep: 40 });

		edges.forEach((edge) => {
			const labelWidth = edge.measured?.width ?? 0; // measure your label if you render one
			const labelHeight = edge.measured?.height ?? 0; // or choose a sensible default
			g.setEdge(edge.source, edge.target, {
				// If you have a label string you can pass it too; the box is what reserves space:
				label: edge.label ?? '',
				width: labelWidth + 1000,
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
	{nodeTypes}
	{colorMode}
	connectionLineType={ConnectionLineType.SmoothStep}
	defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
	maxZoom={1.2}
	minZoom={0.4}
>
	<Panel position="top-right">
		<button onclick={() => onLayout('TB')}>vertical layout</button>
		<button onclick={() => onLayout('LR')}>horizontal layout</button>
	</Panel>
	<MiniMap />
	<Controls />
</SvelteFlow>
