<script lang="ts">
	import FileTree from './components/filetree/file-tree.svelte';
	import CodeEditor from './components/editor/editor.svelte';
	import { Button } from 'flowbite-svelte';
	import { db } from '$lib/db';
	import { parse } from '@lang/parse';
	import { grammar } from '$lib/utils/grammar';
	import { isNonNullish, isNullish } from 'remeda';
	import { getCodeEditorContext } from './code-editor.svelte.ts';
	import { liveQuery } from 'dexie';

	let context = getCodeEditorContext();
	let isSaving = false;
	let editorRef: any = null;

	let files = liveQuery(async () => await db.files.toArray());
	let active_file_name: string | undefined = $state();

	$effect(() => {
		let id = context.active_file_id;
		if (isNullish(id) || !$files) return;
		const file = $files.find((f) => f.id === id!);
		active_file_name = file?.name;
		editorRef?.setDoc(file?.content ?? '');
	});

	async function onSave() {
		const { active_file_id } = context;
		if (active_file_id == null) return;
		isSaving = true;
		try {
			const content = editorRef?.getDoc() ?? '';
			/**
			 * Transactions should only exist in the database as utility for querying
			 * Delete all transactions for the file before upserting new updates
			 * @todo extract this
			 * */
			await db.transaction('rw', db.files, db.transitions, async () => {
				const { active_file_id } = context;

				if (isNullish(active_file_id)) throw new Error('Attempt to save a file with none selected');

				await db.files.update(active_file_id, { content, updatedAt: Date.now() });
				await db.transitions.where('file_id').equals(active_file_id).delete();

				const result = parse(grammar, content);

				// const positions = result?.positions.filter(isNonNullish);

				const transitions = result?.transitions
					.filter(isNonNullish)
					.map((t) => ({ ...t, file_id: active_file_id }));

				if (transitions?.length) {
					await db.transitions.bulkPut(transitions);
				}
			});
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex h-full max-h-full gap-3">
	<FileTree />
	<div class="flex h-full min-h-[300px] flex-1 flex-col gap-2">
		<div class="flex items-center justify-between gap-2">
			<div class="text-xs opacity-80">
				{#if context.active_file_id !== null}
					<span class="opacity-70">File:</span> {active_file_name}
				{:else}
					<span class="opacity-70">No file selected</span>
				{/if}
			</div>
			<Button
				onclick={onSave}
				class="cursor-pointer rounded bg-blue-600 px-3 py-1 text-xs text-white focus-within:outline-0 focus:ring-0 focus-visible:outline-0"
				>Save</Button
			>
		</div>
		<CodeEditor bind:this={editorRef} value={''} language="transition" />
	</div>
</div>
