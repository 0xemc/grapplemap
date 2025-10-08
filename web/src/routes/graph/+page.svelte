<script>
	import { Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
	import TransitionNode from './TransitionNode.svelte';

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

	let edges = $state.raw([{ id: 'e1-2', source: 'node-1', target: '2' }]);
</script>

<div style:width="100vw" style:height="100vh">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView>
		<MiniMap />
		<Controls />
	</SvelteFlow>
</div>
