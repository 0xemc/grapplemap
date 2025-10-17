<script lang="ts">
	import FileTree from '$lib/components/FileTree/FileTree.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { Button } from 'flowbite-svelte';
	import { db } from '$lib/db';

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
			await db.file().write(activeFileId, content);
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
