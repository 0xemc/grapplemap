<script lang="ts">
	import { page } from '$app/state';
	import FileSelect from '$lib/components/file-select/file-select.svelte';
	import MultiSelect from '$lib/components/multi-select.svelte';
	import { db } from '$lib/db';
	import { getSharedModeContext } from '$lib/share/context';
	import { compact } from '$lib/utils/array';
	import { setParam } from '$lib/utils/params';
	import { Panel } from '@xyflow/svelte';
	import { liveQuery } from 'dexie';
	import { Button } from 'flowbite-svelte';
	import { AdjustmentsHorizontalOutline, MinusOutline } from 'flowbite-svelte-icons';
	import { unique } from 'remeda';

	const sharedMode = getSharedModeContext();

	let fileIds = $derived(page.url.searchParams.getAll('file').map(Number));
	let tagIds = $derived(page.url.searchParams.getAll('tag'));

	let filtersOpen = $state<boolean>(false);
	let desktopFiltersOpen = $state<boolean>(true);
	let files = liveQuery(async () => await db.files.toArray());
	let _transitions = liveQuery(async () => await db.transitions.toArray());

	let transition_tags = $derived(
		unique($_transitions?.flatMap((t) => t.tags).filter((t) => !t?.includes('url:')) ?? [])
	);

	function onFilesChange(ids: number[]) {
		setParam('file', ids.map(String));
	}

	function onTagChange(tags: string[]) {
		setParam('tag', tags);
	}
</script>

<Panel position="top-right" class="border-0 bg-transparent p-0 shadow-none">
	<!-- Toggle button visible only when collapsed for current breakpoint -->
	<Button
		size="sm"
		color="light"
		onclick={() => {
			filtersOpen = true;
			desktopFiltersOpen = true;
		}}
		class={`${filtersOpen ? 'hidden' : 'inline-flex'} ${desktopFiltersOpen ? 'md:hidden' : 'md:inline-flex'} border-chisel-100 rounded border bg-white p-2 shadow`}
	>
		<AdjustmentsHorizontalOutline class="h-6 w-6 shrink-0" />
	</Button>

	<!-- Content box: visible on mobile when filtersOpen, on desktop when desktopFiltersOpen -->
	<div
		class={`${filtersOpen ? 'flex' : 'hidden'} ${desktopFiltersOpen ? 'md:flex' : 'md:hidden'} shadow-nondark:bg-chisel-700 border-chisel-100 w-60 flex-col gap-2 rounded-lg border bg-white p-2 shadow`}
	>
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold">Filters</span>
			<Button
				size="xs"
				color="light"
				onclick={() => {
					filtersOpen = false;
					desktopFiltersOpen = false;
				}}
				class="p-1"
			>
				<MinusOutline class="h-4 w-4" />
			</Button>
		</div>
		{#if !sharedMode}
			<FileSelect files={$files} onChange={onFilesChange} initial={fileIds} />
		{/if}
		<MultiSelect
			items={compact(transition_tags).map((t) => ({ value: t, name: t }))}
			label="Tags"
			searchPlaceholder="Select tags..."
			onChange={onTagChange}
			initial={tagIds}
		/>
	</div>
</Panel>
