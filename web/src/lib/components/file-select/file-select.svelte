<script lang="ts">
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { Button, Listgroup, ListgroupItem } from 'flowbite-svelte';

	export let files: File[];

	// $effect(() => {
	// 	// Initialize selection to all files when files first load
	// 	const f = $files as any[];
	// 	if (!f || f.length === 0) return;
	// 	if (selectedFileIds.size === 0) {
	// 		selectedFileIds = new Set(f.map((x) => x.id));
	// 	}
	// });

	// function toggleFileSelection(id: number, checked: boolean) {
	// 	const next = new Set(selectedFileIds);
	// 	if (checked) next.add(id);
	// 	else next.delete(id);
	// 	selectedFileIds = next;
	// }

	// function selectAllFiles() {
	// 	const f = files as any[];
	// 	if (!f) return;
	// 	selectedFileIds = new Set(f.map((x) => x.id));
	// }

	// function clearAllFiles() {
	// 	selectedFileIds = new Set();
	// }
</script>

<div class="dark:bg-chisel-700 w-60 rounded bg-white p-2 shadow">
	<div class="mb-2 flex items-center justify-between gap-2">
		<Button size="xs">All</Button>
		<Button size="xs" color="light">None</Button>
	</div>
	<div class="max-h-64 overflow-auto pr-1">
		<Listgroup class="space-y-1">
			{#each $files as f (f.id)}
				<ListgroupItem class="flex items-center gap-2">
					<input
						type="checkbox"
						checked={selectedFileIds.has(f.id)}
						onchange={(e: any) => toggleFileSelection(f.id, e.currentTarget.checked)}
					/>
					<span class="truncate text-sm">{f.name}</span>
				</ListgroupItem>
			{/each}
		</Listgroup>
	</div>
</div>
