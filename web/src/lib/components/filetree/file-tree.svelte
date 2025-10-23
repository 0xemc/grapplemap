<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { db } from '$lib/db';
	import File from './file.svelte';
	import { liveQuery } from 'dexie';

	let activeId: number | null = $state(null);

	let files = liveQuery(() => db.files.toArray());

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

	/** Select the first file if none has been selected */
	$effect(() => {
		if ($files?.length > 0 && activeId === null) {
			activeId = $files[0].id ?? null;
			dispatch('select', { id: activeId });
		}
	});
</script>

<div
	class="min-w-45 z-50 hidden min-h-64 rounded-lg border border-zinc-800 p-6 md:block dark:border-zinc-700"
>
	<div class="mb-2 flex items-center justify-between text-xs opacity-80">
		<span class="uppercase tracking-wider opacity-70">Files</span>
		<button
			onclick={onAddFile}
			title="New file"
			class="bg-chisel-50 hover:text-chisel-50 dark:hover:text-chisel-50 border-chisel-400 cursor-pointer rounded border px-2 py-1 text-[11px] hover:bg-zinc-700 dark:border-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
			>New</button
		>
	</div>
	{#if files}
		<ul>
			{#each $files as f (f.id!)}
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
