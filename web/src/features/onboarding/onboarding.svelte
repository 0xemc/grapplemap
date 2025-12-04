<script lang="ts">
	import { onMount } from 'svelte';
	import EditorIntro from './components/editor-intro.svelte';
	import GraphIntro from './components/graph-intro.svelte';

	type Props = {
		feature: 'graph' | 'editor';
	};
	let { feature }: Props = $props();

	const KEY_GRAPH = 'grapplemap:intro:graph:dismissed';
	const KEY_EDITOR = 'grapplemap:intro:editor:dismissed';
	let show = $state(false);

	function storageKey() {
		return feature === 'graph' ? KEY_GRAPH : KEY_EDITOR;
	}

	onMount(() => {
		try {
			show = localStorage.getItem(storageKey()) !== '1';
		} catch {
			show = true;
		}
	});

	function dismiss() {
		try {
			localStorage.setItem(storageKey(), '1');
		} catch {
			// ignore storage errors
		}
		show = false;
	}
</script>

{#if show}
	{#if feature === 'graph'}
		<GraphIntro onDismiss={dismiss} />
	{:else if feature === 'editor'}
		<EditorIntro onDismiss={dismiss} />
	{/if}
{/if}
