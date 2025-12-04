<script lang="ts">
	import InfoPane, { type InfoStep } from '$lib/components/info-pane/info-pane.svelte';
	const { onDismiss } = $props<{ onDismiss?: () => void }>();

	const steps: InfoStep[] = [
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
			body: 'Moves are the connections between positions. These can be sweeps, takedowns or submissions. Click one to see more detail and/or a video of the move.'
		},
		{
			title: 'Filters',
			body: 'Moves & positions can be filtered from the graph by file, tag or position name.'
		},
		{
			title: 'Editor',
			body: 'Clicking the <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" class="inline h-4 w-4 align-[-0.125em]" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/></svg> button in the side panel (or in the bottom tabs in mobile) will open the editor where we can define our transitions and positions.'
		}
	];
</script>

<InfoPane {steps} position="top-left" {onDismiss} />
