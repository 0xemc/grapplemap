<script lang="ts">
	import { db } from '$lib/db';
	import { createEventDispatcher } from 'svelte';
	export let id: number;
	export let name: string;
	export let active: boolean = false;

	const dispatch = createEventDispatcher<{ select: void }>();

	async function onRename() {
		const next = prompt('Rename file', name);
		if (next && next.trim() && next !== name) {
			await db.file().rename(id, next.trim());
		}
	}

	async function onDelete() {
		if (confirm(`Delete "${name}"?`)) {
			await db.file().delete(id);
		}
	}

	function onSelect() {
		dispatch('select');
	}
</script>

<div
	role="button"
	tabindex="0"
	class="flex w-full cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-left text-sm font-light hover:bg-zinc-500/50 dark:hover:bg-zinc-700/40 {active
		? 'bg-chisel-200/60 font-medium dark:bg-zinc-700/50'
		: ''}"
	on:click={onSelect}
	on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
>
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
	<span class="ml-auto flex items-center gap-1 text-xs opacity-80">
		<button
			on:click|stopPropagation={onRename}
			title="Rename"
			class="rounded p-0.5 hover:bg-zinc-800 dark:hover:bg-zinc-700"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg
			>
		</button>
		<button
			on:click|stopPropagation={onDelete}
			title="Delete"
			class="rounded p-0.5 hover:bg-red-900/40 dark:hover:bg-red-900/40"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><polyline points="3 6 5 6 21 6" /><path
					d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
				/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg
			>
		</button>
	</span>
</div>
