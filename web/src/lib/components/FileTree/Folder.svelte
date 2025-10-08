<script lang="ts">
	import File from './File.svelte';
	import { slide } from 'svelte/transition';
	import { createFile, createFolder, renameNode, deleteNode } from '$lib/db/fileTree';

	export let expanded = false;
	export let id: number;
	export let name: string;
	export let files: Array<{ id: number; type: 'folder' | 'file'; name: string; files?: any[] }> =
		[];

	function toggle() {
		expanded = !expanded;
	}

	async function onAddFolder() {
		await createFolder(id, 'New Folder');
	}

	async function onAddFile() {
		await createFile(id, 'untitled.txt', '');
	}

	async function onRename() {
		const next = prompt('Rename folder', name);
		if (next && next.trim() && next !== name) {
			await renameNode(id, next.trim());
		}
	}

	async function onDelete() {
		if (confirm(`Delete "${name}" and all its contents?`)) {
			await deleteNode(id);
		}
	}
</script>

<button on:click={toggle} class="font-medium">
	{#if expanded}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-folder-open"
			><path
				d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
			/></svg
		>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-folder"
			><path
				d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
			/></svg
		>
	{/if}
	{name}
</button>

<div class="flex items-center gap-1 text-xs opacity-80">
	<button on:click={onAddFolder} title="New folder">+Folder</button>
	<button on:click={onAddFile} title="New file">+File</button>
	<button on:click={onRename} title="Rename">Rename</button>
	<button on:click={onDelete} title="Delete">Delete</button>
</div>

{#if expanded}
	<ul transition:slide={{ duration: 300 }}>
		{#each files as file (file.id)}
			<li>
				{#if file.type === 'folder'}
					<svelte:self {...file} />
				{:else}
					<File {...file} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	button {
		/* background: url(/tutorial/icons/folder.svg) 0 0.1em no-repeat; */
		background-size: 1em 1em;
		border: none;
		font-size: 14px;
		display: flex;
		gap: 3px;
		align-items: center;
		outline: none;
		background: transparent no-repeat;
	}
	svg {
		/* margin-bottom: 2px; */
		border: none;
		outline: none;
	}
	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 2px solid #555353;
	}

	li {
		padding: 0.2em 1px;
	}
</style>
