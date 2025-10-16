<script lang="ts">
	import Graph from '$lib/components/Graph/Graph.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<div style:width="100vw" style:height="100vh">
	<SvelteFlowProvider>
		<Graph />
	</SvelteFlowProvider>
</div>
