<script lang="ts">
	import { getDbContext } from '$lib/db/context.ts';
	import { liveQuery } from 'dexie';
	import { isNullish } from 'remeda';
	import { getCodeEditorContext } from '../../code-editor.svelte.ts';
	import File from './file.svelte';
	let context = getCodeEditorContext();
	const db = getDbContext();
	let files = liveQuery(() => db.files.toArray());
	let { showOnMobile = false, extraClass = '' } = $props();

	async function onAddFile() {
		const proposed = prompt('New file name', 'untitled');
		if (proposed == null) return; // user cancelled
		const inputName = proposed.trim();
		if (!inputName) return; // empty input, do nothing
		const name = db.file().normalizeName(inputName);
		const id = await db.file().create(name, '');
		context.active_file_id = id;
	}

	/** Select the first file if none has been selected */
	$effect(() => {
		const { active_file_id } = context;
		if ($files?.length > 0 && isNullish(active_file_id)) {
			context.active_file_id = $files[0].id ?? null;
		}
	});
</script>

<div
	class={`min-w-45 z-40 ${showOnMobile ? 'block md:hidden' : 'hidden md:block'} h-fit max-h-full overflow-auto rounded-lg border border-zinc-800 p-6 dark:border-zinc-700 ${extraClass}`}
>
	<div class="items_center mb-2 flex justify-between text-xs opacity-80">
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
						active={f.id === context.active_file_id}
						on:select={() => (context.active_file_id = f.id)}
					/>
				</li>
			{/each}
		</ul>
	{:else}
		Loading...
	{/if}
</div>
