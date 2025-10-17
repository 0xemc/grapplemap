<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { filesStore } from '$lib/stores/fileTree';
	import { db } from '$lib/db';
	import type { File as FileT } from '$lib/db/files';
	import File from './File.svelte';

	let files: FileT[] | null = null;
	let activeId: number | null = null;
	let unsub: (() => void) | null = null;

	const dispatch = createEventDispatcher<{ select: { id: number } }>();

	async function onAddFile() {
		const id = await db.file().create('untitled.grpl', '');
		if (typeof id === 'number') {
			activeId = id;
			dispatch('select', { id });
		}
	}

	function onSelect(id: number) {
		activeId = id;
		dispatch('select', { id });
	}

	onMount(() => {
		const s = filesStore.subscribe((r) => {
			files = r;
			if (files && files.length > 0) {
				const exists = activeId != null && files.some((f) => f.id === activeId);
				if (!exists) {
					activeId = files[0].id ?? null;
					if (activeId != null) dispatch('select', { id: activeId });
				}
			}
		});
		unsub = () => s();
		return () => {
			unsub?.();
		};
	});
</script>

<div
	class="min-w-45 z-50 hidden min-h-64 rounded-lg border border-zinc-800 p-6 md:block dark:border-zinc-700"
>
	<div class="mb-2 flex items-center justify-between text-xs opacity-80">
		<span class="uppercase tracking-wider opacity-70">Files</span>
		<button
			on:click={onAddFile}
			title="New file"
			class="bg-chisel-50 hover:text-chisel-50 dark:hover:text-chisel-50 border-chisel-400 cursor-pointer rounded border px-2 py-1 text-[11px] hover:bg-zinc-700 dark:border-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
			>New</button
		>
	</div>
	{#if files}
		<ul>
			{#each files as f (f.id!)}
				<li class="mb-1">
					<File
						id={f.id!}
						name={f.name}
						active={f.id === activeId}
						on:select={() => onSelect(f.id!)}
					/>
				</li>
			{/each}
		</ul>
	{:else}
		Loading...
	{/if}
</div>
