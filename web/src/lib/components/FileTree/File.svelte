<script lang="ts">
	import { renameNode, deleteNode } from '$lib/db/fileTree';
	export let id: number;
	export let name: string;

	async function onRename() {
		const next = prompt('Rename file', name);
		if (next && next.trim() && next !== name) {
			await renameNode(id, next.trim());
		}
	}

	async function onDelete() {
		if (confirm(`Delete "${name}"?`)) {
			await deleteNode(id);
		}
	}
</script>

<span class="flex w-fit items-center gap-1">
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
		class="mt-px"
	>
		<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
		<path d="M14 2v4a2 2 0 0 0 2 2h4" />
		<path d="M10 9H8" />
		<path d="M16 13H8" />
		<path d="M16 17H8" />
	</svg>
	{name}
	<span class="text-xs opacity-80">
		<button on:click={onRename} title="Rename">Rename</button>
		<button on:click={onDelete} title="Delete">Delete</button>
	</span>
</span>
