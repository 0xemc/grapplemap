<script lang="ts">
	import type { File } from '$lib/db/tables/files';
	import { Button, Checkbox, Listgroup, ListgroupItem } from 'flowbite-svelte';

	type Props = {
		files: File[];
		onChange: (ids: number[]) => void;
	};

	let { onChange, files }: Props = $props();

	let selectedIds: Set<number> = $state(new Set([]));

	function notify() {
		onChange(Array.from(selectedIds));
	}

	function toggleFileSelection(id: number, checked: boolean) {
		const next = new Set(selectedIds);
		if (checked) next.add(id);
		else next.delete(id);
		selectedIds = next;
		notify();
	}

	function selectAll() {
		const f = files as any[] | undefined;
		if (!f) return;
		selectedIds = new Set(f.map((x) => x.id));
		notify();
	}

	function clearAll() {
		selectedIds = new Set();
		notify();
	}
</script>

<div class="dark:bg-chisel-700 border-chisel-100 w-60 rounded-lg border bg-white p-2 shadow">
	<div class="mb-2 flex items-center justify-between gap-2">
		<h4 class="pl-1 font-bold">Files</h4>
		<div>
			<Button size="xs" class="h-6 p-2" onclick={selectAll}>All</Button>
			<Button size="xs" class="h-6 p-2" color="light" onclick={clearAll}>None</Button>
		</div>
	</div>
	<div class="h-[128px] max-h-64 overflow-auto pr-1">
		<Listgroup class="space-y-1">
			{#each files as f (f.id)}
				<ListgroupItem class="flex items-center gap-2">
					<Checkbox
						checked={selectedIds.has(f.id)}
						onchange={(e) =>
							toggleFileSelection(f.id, (e.currentTarget as HTMLInputElement).checked)}
					/>
					<span class="truncate text-sm">{f.name}</span>
				</ListgroupItem>
			{/each}
		</Listgroup>
	</div>
</div>
