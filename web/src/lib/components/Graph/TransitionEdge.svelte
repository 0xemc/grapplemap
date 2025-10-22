<script lang="ts">
	import { BaseEdge, EdgeLabel, getSmoothStepPath, type EdgeProps } from '@xyflow/svelte';
	import { getGraphContext } from './state.svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { VideoCameraSolid } from 'flowbite-svelte-icons';
	let { id, sourceX, sourceY, targetX, targetY, label, sourcePosition, targetPosition }: EdgeProps =
		$props();
	let [path, labelX, labelY] = $derived(
		getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition
		})
	);
	const state = getGraphContext();
	let q = liveQuery(async () => await db.transitions.toArray());
	let _transitions = $derived($q ?? []);
	let transition = $derived(_transitions.find((t) => t.title === id));
	let has_video = $derived(transition?.tags.includes('(url:'));
</script>

<BaseEdge {path} />
<EdgeLabel
	class="dark:bg-chisel-700 border-chisel-100 rounded border bg-white p-12 shadow"
	x={labelX}
	y={labelY}
>
	<button class="nodrag nopan cursor-pointer p-1" onclick={() => (state.selected_edge = id)}>
		<div class="flex flex-col items-center gap-1">
			<span>{label}</span>
			<!-- icons -->
			<div class="flex w-full justify-between px-1">
				<div class="flex items-center">
					<svg
						width="6"
						height="6"
						viewBox="0 0 6 6"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="3" cy="3" r="2.5" stroke="currentColor" stroke-width="1" fill="none" />
					</svg>
				</div>
				{#if has_video}
					<VideoCameraSolid class="h-2 w-2" color="var(--color-secondary-600)" />
				{/if}
			</div>
		</div>
	</button>
</EdgeLabel>
