<script lang="ts">
	import {
		BaseEdge,
		EdgeLabel,
		getSmoothStepPath,
		useSvelteFlow,
		type EdgeProps
	} from '@xyflow/svelte';
	import { getSelfLoopPath } from '../graph.utils';
	import TransitionRow from './transition-row.svelte';
	let props: EdgeProps = $props();

	const { getInternalNode } = useSvelteFlow();

	/** Used for self referencial edges*/
	let srcNode = $derived(() => getInternalNode(props.source));

	let pathData = $derived(
		props.source === props.target ? getSelfLoopPath(props, srcNode()) : getSmoothStepPath(props)
	);

	let path = $derived(pathData[0]);
	let labelX = $derived(pathData[1]);
	let labelY = $derived(pathData[2]);
	const { markerStart, markerEnd } = props;

	const transitions = $derived((props.data as any)?.transitions ?? []);
</script>

<BaseEdge {path} {markerEnd} {markerStart} />
<EdgeLabel
	class="rounded border border-chisel-100 bg-white p-12 shadow dark:bg-chisel-700 "
	x={labelX}
	y={labelY}
>
	<div class="flex flex-col items-center divide-y divide-gray-200">
		{#each transitions as transition}
			<TransitionRow {transition} />
		{/each}
	</div>
</EdgeLabel>
