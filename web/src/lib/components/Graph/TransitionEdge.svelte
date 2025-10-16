<script lang="ts">
	import { BaseEdge, EdgeLabel, getSmoothStepPath, type EdgeProps } from '@xyflow/svelte';
	import { getGraphContext } from './state.svelte';
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
</script>

<BaseEdge {path} />
<EdgeLabel
	class="dark:bg-chisel-700 border-chisel-100 rounded border bg-white p-12 shadow"
	x={labelX}
	y={labelY}
>
	<button class="nodrag nopan cursor-pointer p-1" onclick={() => (state.selected_edge = id)}>
		{label}
	</button>
</EdgeLabel>
