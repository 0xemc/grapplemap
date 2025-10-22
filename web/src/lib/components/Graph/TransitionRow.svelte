<script lang="ts">
	import type { Transition } from '@lang/types';
	import { VideoCameraSolid } from 'flowbite-svelte-icons';
	import { getGraphContext } from './state.svelte';
	type Props = {
		transition: Transition;
	};
	let { transition }: Props = $props();
	const has_video = $derived(transition.tags.includes('(url:'));
	let state = getGraphContext();
</script>

<button
	class="w-full cursor-pointer p-2 text-left hover:bg-gray-100"
	onclick={() => (state.selected_transition = transition.title)}
>
	<span>{transition.title}</span>
	<!-- icons -->
	<div class="flex w-full justify-between pt-1 opacity-70">
		<div class="flex items-center">
			<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="3" cy="3" r="2.5" stroke="currentColor" stroke-width="1" fill="none" />
			</svg>
		</div>
		{#if has_video}
			<VideoCameraSolid class="h-2 w-2" color="var(--color-secondary-600)" />
		{/if}
	</div>
</button>
