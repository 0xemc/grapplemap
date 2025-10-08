<script lang="ts">
	import { Controls, MiniMap, SvelteFlow, type ColorMode } from '@xyflow/svelte';
	import TransitionNode from './TransitionNode.svelte';
	import { currentTheme, observeTheme, type Theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';

	const nodeTypes = { textUpdater: TransitionNode };
	let nodes = $state.raw([
		{
			id: 'node-1',
			type: 'textUpdater',
			position: { x: 0, y: 0 },
			data: { text: 'some text' }
		},
		{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } }
	]);

	let colorMode = $state<ColorMode>(currentTheme());
	onMount(() => observeTheme((t: Theme) => (colorMode = t)));
	let edges = $state.raw([{ id: 'e1-2', source: 'node-1', target: '2' }]);
</script>

<div style:width="100vw" style:height="100vh">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView {colorMode}>
		<MiniMap />
		<Controls />
	</SvelteFlow>
</div>
