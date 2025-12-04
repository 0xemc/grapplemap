<script lang="ts">
	import InfoPane, { type InfoStep } from '$lib/components/info-pane/info-pane.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{ dismiss: void }>();

	const steps: InfoStep[] = [
		{
			title: 'Welcome to GrappleLang',
			body: 'This is the editor for defining Jiu Jiu game plans'
		}
	];
</script>

<InfoPane {steps} position="top-right" on:dismiss={() => dispatch('dismiss')} />
