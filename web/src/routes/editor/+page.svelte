<script lang="ts">
	import FileTree from '$lib/components/FileTree/FileTree.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { getFileById, updateFileContent } from '$lib/db/fileTree';

	let activeFileId: number | null = null;
	let activeFileName = '';
	let isSaving = false;
	let editorRef: any = null;

	async function handleSelect(e: CustomEvent<{ id: number }>) {
		activeFileId = e.detail.id;
		const file = await getFileById(activeFileId);
		activeFileName = file?.name ?? '';
		editorRef?.setDoc(file?.content ?? '');
	}

	async function onSave() {
		if (activeFileId == null) return;
		isSaving = true;
		try {
			const content = editorRef?.getDoc() ?? '';
			await updateFileContent(activeFileId, content);
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="box-border flex h-full flex-col gap-3 p-4">
	<div class="flex gap-3">
		<FileTree on:select={handleSelect} />
		<div class="flex min-h-[300px] flex-1 flex-col gap-2">
			<div class="flex items-center justify-between gap-2">
				<div class="text-xs opacity-80">
					{#if activeFileId !== null}
						<span class="opacity-70">File:</span> {activeFileName}
					{:else}
						<span class="opacity-70">No file selected</span>
					{/if}
				</div>
				<button
					on:click={onSave}
					disabled={activeFileId === null || isSaving}
					class="cursor-pointer rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
					>{isSaving ? 'Saving…' : 'Save'}</button
				>
			</div>
			<CodeEditor bind:this={editorRef} value={''} language="transition" />
		</div>
	</div>
</div>
