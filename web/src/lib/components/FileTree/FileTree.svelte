<script lang="ts">
	import File from './File.svelte';
	import { onMount } from 'svelte';
	import { filesStore } from '$lib/stores/fileTree';
	import { createFile, type Node } from '$lib/db/fileTree';

	let files: Node[] | null = null;
	let unsub: (() => void) | null = null;

	async function onAddFile() {
		await createFile('untitled.txt', '');
	}

	onMount(() => {
		const s = filesStore.subscribe((r) => (files = r));
		unsub = () => s();
		return () => {
			unsub?.();
		};
	});
</script>

<div class="min-w-45 z-50 min-h-64 rounded-lg border border-zinc-800 p-6 dark:border-zinc-700">
	<div class="mb-2 text-xs opacity-80">
		<button on:click={onAddFile} title="New file">+ File</button>
	</div>
	{#if files}
		<ul>
			{#each files as f (f.id!)}
				<li><File id={f.id!} name={f.name} /></li>
			{/each}
		</ul>
	{:else}
		Loading...
	{/if}
</div>
