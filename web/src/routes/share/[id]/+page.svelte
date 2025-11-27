<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Dexie from 'dexie';
	import { createTempDatabase, type Database } from '$lib/db';
	import { setDbContext } from '$lib/db/context';
	import { isNonNullish } from 'remeda';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import Graph from '@features/graph/graph.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import { setSharedModeContext } from '$lib/share/context';
	import { parseFile } from '$lib/db/utils';
	import InfoPane from '$lib/components/info-pane/info-pane.svelte';

	let error: string | null = $state(null);
	let ready = $state(false);
	let tempDb: Database | null = null;

	onMount(async () => {
		try {
			const id = get(page).params.id;
			if (!id) {
				error = 'Missing share id';
				return;
			}
			// Create a temporary DB for this share and set it in context
			tempDb = createTempDatabase(`grapplemap-share-${id}`);
			setDbContext(tempDb);
			setSharedModeContext(true);
			const res = await fetch(`/api/share/${encodeURIComponent(id)}`);
			if (!res.ok) {
				throw new Error('Shared file not found');
			}
			const text = await res.text();
			const name = `_shared_${id}.grpl`;

			await tempDb!.transaction(
				'rw',
				tempDb!.files,
				tempDb!.transitions,
				tempDb.positions,
				async () => {
					const existing = await tempDb!.files.where('name').equals(name).first();
					const now = Date.now();
					const computedId =
						existing?.id != null ? existing.id! : await tempDb!.file().create(name, text);
					if (existing?.id != null) {
						await tempDb!.files.update(computedId, { content: text, updatedAt: now });
						await tempDb!.transitions.where('file_id').equals(computedId).delete();
						await tempDb!.positions.where('file_id').equals(computedId).delete();
					}

					const result = parseFile(computedId, text);

					const transitions =
						result?.transitions?.filter(isNonNullish).map((t) => ({ ...t, file_id: computedId })) ??
						[];
					if (transitions.length) await tempDb!.transitions.bulkPut(transitions);

					const positions =
						result?.positions?.filter(isNonNullish).map((t) => ({ ...t, file_id: computedId })) ??
						[];
					if (positions.length) await tempDb!.positions.bulkPut(positions);
				}
			);

			ready = true;
		} catch (e: any) {
			error = e?.message ?? 'Failed to load shared file';
		}
	});

	onDestroy(async () => {
		if (tempDb) {
			const name = tempDb.name;
			try {
				tempDb.close();
			} finally {
				try {
					await Dexie.delete(name);
				} catch {
					// ignore cleanup errors
				}
			}
			tempDb = null;
		}
	});
</script>

{#if error}
	<div class="flex h-full w-full items-center justify-center">
		<div class="text-sm text-red-600 dark:text-red-400">{error}</div>
	</div>
{:else if !ready}
	<div class="flex h-full w-full items-center justify-center">
		<div class="text-sm opacity-70">Loading shared file…</div>
	</div>
{:else}
	<div style:width="100%" style:height="100%">
		<SvelteFlowProvider>
			<Graph />
		</SvelteFlowProvider>
	</div>
{/if}
