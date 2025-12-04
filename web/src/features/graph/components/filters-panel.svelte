<script lang="ts">
	import FileSelect from '$lib/components/file-select/file-select.svelte';
	import MultiSelect from '$lib/components/multi-select.svelte';
	import type { File } from '$lib/db/tables/files';
	import { compact } from '$lib/utils/array';
	import { Button, Select } from 'flowbite-svelte';
	import { AdjustmentsHorizontalOutline, MinusOutline } from 'flowbite-svelte-icons';

	type Props = {
		sharedMode: boolean;
		files: File[] | undefined;
		fileIds: number[];
		transitionTags: string[];
		tagIds: string[];
		onFilesChange: (ids: number[]) => void;
		onTagChange: (tags: string[]) => void;
		groupTag: string;
		setParam: (key: string, value: string | string[] | null) => void;
	};

	let {
		sharedMode,
		files,
		fileIds,
		transitionTags,
		tagIds,
		onFilesChange,
		onTagChange,
		groupTag,
		setParam
	}: Props = $props();

	let filtersOpen = $state<boolean>(false);
	let desktopFiltersOpen = $state<boolean>(true);

	// Derive unique tag names (the part before ':' or first space)
	const groupableTagNames = $derived(
		Array.from(
			new Set(
				(transitionTags ?? [])
					.filter((t) => typeof t === 'string')
					.map((t) => {
						const s = String(t);
						const colon = s.indexOf(':');
						const space = s.indexOf(' ');
						const idx =
							colon === -1 && space === -1
								? -1
								: colon === -1
									? space
									: space === -1
										? colon
										: Math.min(colon, space);
						return idx === -1 ? s : s.slice(0, idx);
					})
			)
		).sort((a, b) => a.localeCompare(b))
	);
	const groupTagItems = $derived([
		{ value: '', name: 'None' },
		...groupableTagNames.map((t) => ({ value: t, name: t }))
	]);
	// No local binding to avoid loops; update URL only on user change via onchange
</script>

<div class="border-0 bg-transparent p-0 shadow-none">
	<!-- Toggle button visible only when collapsed for current breakpoint -->
	<Button
		size="sm"
		color="light"
		onclick={() => {
			filtersOpen = true;
			desktopFiltersOpen = true;
		}}
		class={`${filtersOpen ? 'hidden' : 'inline-flex'} ${desktopFiltersOpen ? 'md:hidden' : 'md:inline-flex'} rounded border border-chisel-100 bg-white p-2 shadow`}
	>
		<AdjustmentsHorizontalOutline class="h-6 w-6 shrink-0" />
	</Button>

	<!-- Content box: visible on mobile when filtersOpen, on desktop when desktopFiltersOpen -->
	<div
		class={`${filtersOpen ? 'flex' : 'hidden'} ${desktopFiltersOpen ? 'md:flex' : 'md:hidden'} shadow-nondark:bg-chisel-700 w-60 flex-col gap-2 rounded-lg border border-chisel-100 bg-white p-2 shadow`}
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
			<FileSelect files={files ?? []} onChange={onFilesChange} initial={fileIds} />
		{/if}
		<MultiSelect
			items={compact(transitionTags).map((t) => ({ value: t, name: t }))}
			label="Tags"
			searchPlaceholder="Select tags..."
			onChange={onTagChange}
			initial={tagIds}
		/>
		<!-- Grouping: single select for tag name -->
		<div class="flex flex-col gap-2">
			<label for="groupTagSelect" class="pl-1 font-bold">Group</label>
			<Select
				id="groupTagSelect"
				items={groupTagItems}
				value={groupTag ?? ''}
				size="sm"
				class="text-xs"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					if (val === (groupTag ?? '')) return;
					setParam('groupTag', val === '' ? null : val);
				}}
			/>
		</div>
	</div>
</div>
