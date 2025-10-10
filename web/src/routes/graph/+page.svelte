<script lang="ts">
	import { Controls, MiniMap, SvelteFlow, type ColorMode } from '@xyflow/svelte';
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
		});
	});

	$effect(() => console.log(transitions));

	function transitionToEdge(tr: Transition) {
		return { id: tr.title, source: tr.from, target: tr.to, animated: true };
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
</script>

<div style:width="100vw" style:height="100vh">
	<SvelteFlow bind:nodes bind:edges {nodeTypes} fitView {colorMode}>
		<MiniMap />
		<Controls />
	</SvelteFlow>
</div>
