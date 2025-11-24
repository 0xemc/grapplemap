<script lang="ts">
	import { VideoCameraSolid } from 'flowbite-svelte-icons';
	import { getGraphContext } from './graph.state.svelte';
	import type { DBTransition } from '$lib/db/tables/transitions';
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
</script>

<button
	class="w-full cursor-pointer p-2 text-left hover:bg-gray-100"
	onclick={() => (state.selected_transition = transition.id)}
>
	<span>{transition.title}</span>
	<!-- icons -->
	<div class="flex w-full justify-between pt-1 opacity-70">
		<div class="flex items-center">
			<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle
					cx="3"
					cy="3"
					r="2.5"
					stroke="currentColor"
					stroke-width="1"
					fill={beltColorMap[belt_color ?? 'white']}
				/>
			</svg>
		</div>
		{#if has_video}
			<VideoCameraSolid class="h-2 w-2" color="var(--color-secondary-600)" />
		{/if}
	</div>
</button>
