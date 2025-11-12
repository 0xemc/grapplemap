<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import { parse } from '@lang/parse';
	import { grammar } from '$lib/utils/grammar';
	import { isNonNullish } from 'remeda';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let error: string | null = null;

	onMount(async () => {
		try {
			const id = get(page).params.id;
			if (!id) {
				error = 'Missing share id';
				return;
			}
			const res = await fetch(`/api/share/${encodeURIComponent(id)}`);
			if (!res.ok) {
				throw new Error('Shared file not found');
			}
			const text = await res.text();
			const name = `_shared_${id}.grpl`;
			let fileId: number = -1;

			await db.transaction('rw', db.files, db.transitions, async () => {
				const existing = await db.files.where('name').equals(name).first();
				const now = Date.now();
				const computedId = existing?.id != null ? existing.id! : await db.file().create(name, text);
				if (existing?.id != null) {
					await db.files.update(computedId, { content: text, updatedAt: now });
					await db.transitions.where('file_id').equals(computedId).delete();
				}

				const result = parse(grammar, text);
				const transitions =
					result?.transitions?.filter(isNonNullish).map((t) => ({ ...t, file_id: computedId })) ??
					[];
				if (transitions.length) await db.transitions.bulkPut(transitions);
				fileId = computedId;
			});

			if (fileId < 0) throw new Error('Failed to load shared file');
			await goto(`/graph?file=${fileId}`);
		} catch (e: any) {
			error = e?.message ?? 'Failed to load shared file';
		}
	});
</script>

<div class="flex h-full w-full items-center justify-center">
	{#if error}
		<div class="text-sm text-red-600 dark:text-red-400">{error}</div>
	{:else}
		<div class="text-sm opacity-70">Loading shared file…</div>
	{/if}
</div>
