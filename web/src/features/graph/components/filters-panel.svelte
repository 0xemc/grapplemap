<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { AdjustmentsHorizontalOutline, MinusOutline } from 'flowbite-svelte-icons';
	import FileSelect from '$lib/components/file-select/file-select.svelte';
	import MultiSelect from '$lib/components/multi-select.svelte';
	import { compact } from '$lib/utils/array';
	import type { File } from '$lib/db/tables/files';

	type Props = {
		sharedMode: boolean;
		files: File[] | undefined;
		fileIds: number[];
		transitionTags: string[];
		tagIds: string[];
		onFilesChange: (ids: number[]) => void;
		onTagChange: (tags: string[]) => void;
		rawGroupNodes: string;
		rawGroupEdges: string;
		rawOrderKey: string;
		rawOrderType: 'num' | 'lex';
		rawOrderDir: 'asc' | 'desc';
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
		rawGroupNodes,
		rawGroupEdges,
		rawOrderKey,
		rawOrderType,
		rawOrderDir,
		setParam
	}: Props = $props();

	let filtersOpen = $state<boolean>(false);
	let desktopFiltersOpen = $state<boolean>(true);
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
			<FileSelect files={files} onChange={onFilesChange} initial={fileIds} />
		{/if}
		<MultiSelect
			items={compact(transitionTags).map((t) => ({ value: t, name: t }))}
			label="Tags"
			searchPlaceholder="Select tags..."
			onChange={onTagChange}
			initial={tagIds}
		/>
		<div class="flex flex-col gap-2">
			<label for="groupNodesSelect" class="text-[10px] font-semibold text-gray-600"
				>Group nodes</label
			>
			<select
				id="groupNodesSelect"
				class="border-chisel-100 rounded border px-2 py-1 text-xs"
				onchange={(e) => setParam('groupNodes', (e.target as HTMLSelectElement).value)}
			>
				<option value="position" selected={rawGroupNodes === 'position'}>Position</option>
				<option value="position,tag:week" selected={rawGroupNodes === 'position,tag:week'}>
					Position + Tag:week
				</option>
				<option value="position,file" selected={rawGroupNodes === 'position,file'}>
					Position + File
				</option>
			</select>
		</div>
		<div class="flex flex-col gap-2">
			<label for="groupEdgesSelect" class="text-[10px] font-semibold text-gray-600"
				>Group edges</label
			>
			<select
				id="groupEdgesSelect"
				class="border-chisel-100 rounded border px-2 py-1 text-xs"
				onchange={(e) => setParam('groupEdges', (e.target as HTMLSelectElement).value)}
			>
				<option value="" selected={rawGroupEdges === ''}>None</option>
				<option value="tag:week" selected={rawGroupEdges === 'tag:week'}>Tag:week</option>
				<option value="file" selected={rawGroupEdges === 'file'}>File</option>
			</select>
		</div>
		<div class="flex flex-col gap-1">
			<label for="orderKeySelect" class="text-[10px] font-semibold text-gray-600"
				>Order bands</label
			>
			<select
				id="orderKeySelect"
				class="border-chisel-100 rounded border px-2 py-1 text-xs"
				onchange={(e) => setParam('orderKey', (e.target as HTMLSelectElement).value)}
			>
				<option value="none" selected={rawOrderKey === 'none'}>None</option>
				<option value="tag:week" selected={rawOrderKey === 'tag:week'}>Tag:week</option>
				<option value="label" selected={rawOrderKey === 'label'}>Label</option>
			</select>
			<div class="flex gap-2">
				<select
					id="orderTypeSelect"
					class="border-chisel-100 rounded border px-2 py-1 text-xs"
					onchange={(e) => setParam('orderType', (e.target as HTMLSelectElement).value)}
				>
					<option value="lex" selected={rawOrderType === 'lex'}>Lex</option>
					<option value="num" selected={rawOrderType === 'num'}>Numeric</option>
				</select>
				<select
					id="orderDirSelect"
					class="border-chisel-100 rounded border px-2 py-1 text-xs"
					onchange={(e) => setParam('orderDir', (e.target as HTMLSelectElement).value)}
				>
					<option value="asc" selected={rawOrderDir === 'asc'}>Asc</option>
					<option value="desc" selected={rawOrderDir === 'desc'}>Desc</option>
				</select>
			</div>
		</div>
	</div>
</div>


