<script lang="ts">
	import Graph from '@features/graph/graph.svelte';
	import Onboarding from '@features/onboarding/onboarding.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<div style:width="100%" style:height="100%">
	<SvelteFlowProvider>
		<Graph />
	</SvelteFlowProvider>
	<Onboarding feature="graph" />
</div>
