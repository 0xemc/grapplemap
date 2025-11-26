<script lang="ts">
	import Graph from '$lib/components/graph/graph.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import IntroPane from '@features/intro-pane/intro-pane.svelte';
</script>

<div style:width="100%" style:height="100%">
	<SvelteFlowProvider>
		<Graph />
	</SvelteFlowProvider>
	<IntroPane />
</div>
