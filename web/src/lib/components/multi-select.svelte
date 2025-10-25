<script lang="ts">
	import { Input, Badge } from 'flowbite-svelte';
	import type { SelectOptionType } from 'flowbite-svelte';

	type Props = {
		items: SelectOptionType<string>[];
		onChange?: (values: string[]) => void;
		label?: string;
		selectPlaceholder?: string;
		searchPlaceholder?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		initial?: string[];
	};

	let {
		items,
		onChange,
		label,
		searchPlaceholder = 'Filter options…',
		size = 'md',
		disabled = false,
		initial = []
	}: Props = $props();

	let selected: string[] = $state([...initial]);
	let search: string = $state('');
	let isOpen: boolean = $state(false);
	let highlightIndex: number = $state(-1);

	const valueToItem = (value: string) => items.find((i) => i.value === value);
	const normalized = (s: string) => s.toLowerCase();

	let filteredItems: SelectOptionType<string>[] = $derived(
		(!search
			? items
			: items.filter((i) => {
					const name = i.name ?? String(i.value);
					const needle = normalized(search);
					return (
						normalized(String(name)).includes(needle) ||
						normalized(String(i.value)).includes(needle)
					);
				})
		).filter((i) => !selected.includes(String(i.value)))
	);

	function remove(value: string) {
		selected = selected.filter((v) => v !== value);
		onChange?.(selected);
	}

	function add(value: string) {
		if (!selected.includes(value)) {
			selected = [...selected, value];
			onChange?.(selected);
		}
		search = '';
		isOpen = false;
		highlightIndex = -1;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
			isOpen = true;
		}
		if (e.key === 'Backspace' && search === '' && selected.length > 0) {
			remove(selected[selected.length - 1]);
			return;
		}
		if (!filteredItems.length) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightIndex = (highlightIndex + 1) % filteredItems.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightIndex = (highlightIndex - 1 + filteredItems.length) % filteredItems.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const item = filteredItems[highlightIndex] ?? filteredItems[0];
			if (item && !item.disabled) add(String(item.value));
		} else if (e.key === 'Escape') {
			isOpen = false;
			highlightIndex = -1;
		}
	}

	$effect(() => {
		onChange?.(selected);
	});
</script>

<div class="flex flex-col gap-2">
	{#if label}
		<h4 class="pl-1 font-bold">{label}</h4>
	{/if}

	<div class="relative">
		<Input
			placeholder={searchPlaceholder}
			value={search}
			{size}
			{disabled}
			class="bg-white"
			onfocus={() => (isOpen = true)}
			onblur={() => (isOpen = false)}
			oninput={(e: Event) => {
				search = (e.currentTarget as HTMLInputElement).value;
				isOpen = true;
				highlightIndex = -1;
			}}
			onkeydown={onKeyDown}
		/>

		{#if isOpen && filteredItems.length > 0}
			<div
				class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
				role="listbox"
				tabindex="-1"
				onmousedown={(e) => e.preventDefault()}
			>
				{#each filteredItems as item, i (item.value)}
					<button
						type="button"
						role="option"
						aria-selected={i === highlightIndex}
						disabled={item.disabled}
						class="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 {i ===
						highlightIndex
							? 'bg-gray-100 dark:bg-gray-700'
							: ''}"
						onclick={() => add(String(item.value))}
						onmouseover={() => (highlightIndex = i)}
						onfocus={() => (highlightIndex = i)}
					>
						{item.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if selected.length > 0}
		<div class="flex flex-wrap gap-2 pt-1">
			{#each selected as v (v)}
				{#if valueToItem(v)}
					{@const item = valueToItem(v)!}
					<Badge color={(item as any).color} dismissable onclose={() => remove(v)} class="mx-0.5">
						{item.name ?? String(item.value)}
					</Badge>
				{:else}
					<Badge dismissable onclose={() => remove(v)} class="mx-0.5">{v}</Badge>
				{/if}
			{/each}
		</div>
	{/if}
</div>
