<script lang="ts">
	import {
		Background,
		BackgroundVariant,
		Controls,
		MiniMap,
		SvelteFlow,
		type ColorMode
	} from '@xyflow/svelte';
	import TransitionNode from '../../lib/components/TransitionNode.svelte';
	import { currentTheme, observeTheme, type Theme } from '$lib/utils/theme';
	import { onMount } from 'svelte';
	import { filesStore } from '$lib/stores/fileTree';
	import { type FileT } from '$lib/db/fileTree';
	import { type Transition } from '@lang/types';
	import { promiseHooks } from 'v8';
	const nodeTypes = { textUpdater: TransitionNode };
	let nodes = $state.raw([{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } }]);

	let colorMode = $state<ColorMode>(currentTheme());
	onMount(() => observeTheme((t: Theme) => (colorMode = t)));

	let files = $state<FileT[] | null>(null);
	let transitions = $state<Transition[] | null>(null);

	// Subscribe on mount; cleanup on teardown
	$effect(() => {
		const unsub = filesStore.subscribe((v) => {
			files = v;
		});
		return () => unsub();
	});

	$effect(() => console.log(transitions));

	function transitionToNode(tr: Transition) {
		return {
			id: tr.title,
			position: { x: 0, y: 0 },
			data: tr
		};
	}

	let edges = $state.raw([{ id: 'e1-2', source: 'node-1', target: '2' }]);
</script>

<div style:width="100vw" style:height="100vh">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView {colorMode}>
		<MiniMap />
		<Controls />
	</SvelteFlow>
</div>
