<script lang="ts">
	import FileTree from '$lib/components/filetree/file-tree.svelte';
	import CodeEditor from '$lib/components/code-editor.svelte';
	import { Button } from 'flowbite-svelte';
	import { db } from '$lib/db';
	import { parse } from '@lang/parse';
	import { grammar } from '$lib/utils/grammar';
	import { isNonNullish } from 'remeda';

	let activeFileId: number | null = null;
	let activeFileName = '';
	let isSaving = false;
	let editorRef: any = null;

	async function handleSelect(e: CustomEvent<{ id: number }>) {
		activeFileId = e.detail.id;
		const file = await db.file().getById(activeFileId);
		activeFileName = file?.name ?? '';
		editorRef?.setDoc(file?.content ?? '');
	}

	async function onSave() {
		if (activeFileId == null) return;
		isSaving = true;
		try {
			const content = editorRef?.getDoc() ?? '';
			/**
			 * Transactions should only exist in the database as utility for querying
			 * Delete all transactions for the file before upserting new updates
			 * @todo extract this
			 * */
			await db.transaction('rw', db.files, db.transitions, async () => {
				await db.files.update(activeFileId as number, { content, updatedAt: Date.now() });
				await db.transitions
					.where('file_id')
					.equals(activeFileId as number)
					.delete();

				const transitions = parse(grammar, content)
					?.transitions.filter(isNonNullish)
					.map((t) => ({ ...t, file_id: activeFileId as number }));
				if (transitions?.length) {
					await db.transitions.bulkPut(transitions);
				}
			});
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="box-border flex h-full max-h-full flex-col gap-3 p-4">
	<div class="flex h-full max-h-full gap-3">
		<FileTree on:select={handleSelect} />
		<div class="flex h-full min-h-[300px] flex-1 flex-col gap-2">
			<div class="flex items-center justify-between gap-2">
				<div class="text-xs opacity-80">
					{#if activeFileId !== null}
						<span class="opacity-70">File:</span> {activeFileName}
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
</div>
