<script lang="ts">
	import Folder from './Folder.svelte';
	import { onMount } from 'svelte';
	import { rootTree } from '$lib/stores/fileTree';
	import { ensureRoot } from '$lib/db/fileTree';

	let root: any = null;
	let unsub: (() => void) | null = null;

	onMount(() => {
		(async () => {
			await ensureRoot();
			const s = rootTree.subscribe((r) => (root = r));
			unsub = () => s();
		})();
		return () => {
			unsub?.();
		};
	});
</script>

<div class="min-w-45 z-50 min-h-64 rounded-lg border border-zinc-800 p-6 dark:border-zinc-700">
	{#if root}
		<Folder {...root} expanded />
	{:else}
		Loading...
	{/if}
</div>
