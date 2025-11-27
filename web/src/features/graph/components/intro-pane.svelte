<script lang="ts">
	import InfoPane from '$lib/components/info-pane/info-pane.svelte';

	const steps = [
		{
			title: 'Welcome to GrappleMap',
			body: 'You can use this graph to visualize and understand positions and transitions in Jiu Jitsu & Grappling.'
		},
		{
			title: 'Positions',
			body: 'Positions (e.g Closed Guard, Mount) are represented as nodes. Drag them around to re-arrange the graph.'
		},
		{
			title: 'Transitions',
			body: 'Moves are the connections between nodes. These can be sweeps, takedowns or submissions. Click one to see more detail and/or a video of the move.'
		}
	];
</script>

<InfoPane {steps} position="top-left" />
