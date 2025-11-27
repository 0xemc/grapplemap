<script lang="ts">
	import { VideoCameraSolid } from 'flowbite-svelte-icons';
	import { getGraphContext } from '../graph.state.svelte';
	import type { DBTransition } from '$lib/db/tables/transitions';
	import { ArrowUpRightDownLeftOutline } from 'flowbite-svelte-icons';
	type Props = {
		transition: DBTransition;
	};
	let { transition }: Props = $props();

	const beltColorMap: Record<string, string> = {
		white: '#ffffff',
		blue: '#3b82f6',
		purple: '#a855f7',
		brown: '#a16207',
		black: '#111827'
	};
	const has_video = $derived((transition?.tags ?? []).some((t) => t.includes('url:')));
	const belt_color = $derived(
		(transition?.tags ?? []).find((t) => t.includes('belt:'))?.split(':')[1]
	);
	let state = getGraphContext();

	const beltOrder = Object.keys(beltColorMap);
	function beltsUpTo(color?: string) {
		const idx = color ? beltOrder.indexOf(color) : 0;
		const end = idx >= 0 ? idx : 0;
		return beltOrder.slice(0, end + 1);
	}
</script>

<button
	class="relative w-full cursor-pointer p-2 text-left hover:bg-gray-100"
	onclick={() => (state.selected_transition = transition.id)}
>
	<div class="flex">
		<span>{transition.title}</span>
		<div class="h-4 w-5"></div>
	</div>
	<ArrowUpRightDownLeftOutline class="absolute right-1 top-1 inline w-3 text-gray-600" />

	<!-- icons -->
	<div class="flex w-full justify-between pt-1 opacity-90">
		<div class="flex items-center gap-1">
			{#each beltsUpTo(belt_color) as belt, i}
				<svg
					width="6"
					height="6"
					viewBox="0 0 6 6"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class={i === 0 ? '' : 'ml-0.5'}
				>
					<circle
						cx="3"
						cy="3"
						r="2.5"
						stroke="currentColor"
						stroke-width="1"
						fill={beltColorMap[belt]}
					/>
				</svg>
			{/each}
		</div>
		{#if has_video}
			<VideoCameraSolid class="h-2 w-2" color="var(--color-secondary-600)" />
		{/if}
	</div>
</button>
