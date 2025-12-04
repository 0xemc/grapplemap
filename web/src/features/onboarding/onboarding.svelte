<script lang="ts">
	import { onMount } from 'svelte';
	import EditorIntro from './components/editor-intro.svelte';
	import GraphIntro from './components/graph-intro.svelte';

	type Props = {
		feature: 'graph' | 'editor';
	};
	let { feature }: Props = $props();

	const STORAGE_KEY = 'grapplemap:intro:dismissed';
	let show = $state(false);

	onMount(() => {
		try {
			show = localStorage.getItem(STORAGE_KEY) !== '1';
		} catch {
			show = true;
		}
	});

	function dismiss() {
		try {
			localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// ignore storage errors
		}
		show = false;
	}
</script>

{#if show}
	{#if feature === 'graph'}
		<GraphIntro on:dismiss={dismiss} />
	{:else if feature === 'editor'}
		<EditorIntro on:dismiss={dismiss} />
	{/if}
{/if}
