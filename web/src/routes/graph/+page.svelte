<script lang="ts">
	import Graph from '$lib/components/graph/graph.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<div style:width="100%" style:height="100%">
	<SvelteFlowProvider>
		<Graph />
	</SvelteFlowProvider>
</div>
