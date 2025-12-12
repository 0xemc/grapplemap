<script lang="ts">
	import { getDbContext } from '$lib/db/context.ts';
	import { liveQuery } from 'dexie';
	import { Button } from 'flowbite-svelte';
	import { isNullish } from 'remeda';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { uploadMap } from '../upload/share.utils';
	import { getCodeEditorContext } from './code-editor.svelte.ts';
	import { saveCodeFile } from './code-editor.utils';
	import CodeEditor from './components/editor/editor.svelte';
	import FileTree from './components/filetree/file-tree.svelte';

	let context = getCodeEditorContext();
	let isSaving = $state(false);
	let isSharing = $state(false);
	let editorRef: any = null;
	const db = getDbContext();
	let files = liveQuery(async () => await db.files.toArray());
	let active_file_name: string | undefined = $state();
	let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
	const AUTO_SAVE_MS = 3000;
	let fileTreeOpen: boolean = $state(false);

	$effect(() => {
		let id = context.active_file_id;
		if (isNullish(id) || !$files) return;
		const file = $files.find((f) => f.id === id!);
		active_file_name = file?.name;
		editorRef?.setDoc(file?.content ?? '');
	});

	function scheduleAutoSave(_e?: any) {
		if (autoSaveTimer) clearTimeout(autoSaveTimer);
		autoSaveTimer = setTimeout(() => {
			onSave({ showToast: false, source: 'auto' });
		}, AUTO_SAVE_MS);
	}

	onDestroy(() => {
		if (autoSaveTimer) clearTimeout(autoSaveTimer);
	});

	async function onSave(opts: { showToast?: boolean; source?: 'manual' | 'auto' } = {}) {
		const { active_file_id } = context;
		if (active_file_id == null) return;
		isSaving = true;
		try {
			const content = editorRef?.getDoc() ?? '';
			if (isNullish(active_file_id)) throw new Error('Attempt to save a file with none selected');

			await saveCodeFile(db, active_file_id, content);

			if (opts.showToast) {
				toast.success('Saved', {
					description: active_file_name ? `Updated ${active_file_name}` : undefined,
					duration: 1500
				});
			}
		} catch (e) {
			// Keep autosave failures non-fatal, but visible.
			toast.error('Failed to save', {
				description: e instanceof Error ? e.message : undefined
			});
			console.error(e);
		} finally {
			isSaving = false;
		}
	}

	async function onShare() {
		const { active_file_id } = context;
		if (active_file_id == null) return;
		isSharing = true;
		try {
			const content = editorRef?.getDoc() ?? '';
			const res = await uploadMap(content);
			if (!res) {
				toast.error('Failed to share file');
				return;
			}
			const link = res.url;
			if (link) {
				await navigator.clipboard.writeText(link);
				toast.success('Share link ready', {
					description: link,
					action: {
						label: 'Open',
						onClick: () => window.open(link, '_blank')
					}
				});
			}
		} finally {
			isSharing = false;
		}
	}
</script>

<div class="flex h-full max-h-full gap-3">
	<FileTree />
	<div class="flex h-full min-h-[300px] flex-1 flex-col gap-2">
		<div class="flex items-center justify-between gap-2">
			<div class="text-xs opacity-80">
				<Button size="xs" color="light" onclick={() => (fileTreeOpen = true)} class="mr-2 md:hidden"
					>Files</Button
				>
				{#if context.active_file_id !== null}
					<span class="opacity-70">File:</span> {active_file_name}
				{:else}
					<span class="opacity-70">No file selected</span>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<Button
					onclick={onShare}
					disabled={context.active_file_id === null || isSharing}
					class="cursor-pointer rounded bg-emerald-600 px-3 py-1 text-xs text-white focus-within:outline-0 focus:ring-0 focus-visible:outline-0 disabled:opacity-60"
					>Share</Button
				>
				<Button
					onclick={() => onSave({ showToast: true, source: 'manual' })}
					disabled={context.active_file_id === null || isSaving}
					class="cursor-pointer rounded bg-blue-600 px-3 py-1 text-xs text-white focus-within:outline-0 focus:ring-0 focus-visible:outline-0 disabled:opacity-60"
					>Save</Button
				>
			</div>
		</div>
		<CodeEditor
			bind:this={editorRef}
			value={''}
			language="transition"
			onDocChanged={scheduleAutoSave}
		/>
	</div>
</div>

{#if fileTreeOpen}
	<div class="fixed inset-0 z-50 md:hidden">
		<div
			class="absolute left-0 top-0 flex h-full w-64 flex-col gap-2 bg-white p-3 shadow-xl dark:bg-zinc-900"
		>
			<Button
				size="xs"
				color="light"
				class="ml-auto w-fit text-xs"
				onclick={() => (fileTreeOpen = false)}>Close</Button
			>
			<FileTree showOnMobile={true} extraClass=" w-full h-full max-h-full" />
		</div>
	</div>
{/if}
