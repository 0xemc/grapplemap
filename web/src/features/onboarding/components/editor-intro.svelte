<script lang="ts">
	import InfoPane, { type InfoStep } from '$lib/components/info-pane/info-pane.svelte';
	const { onDismiss } = $props<{ onDismiss?: () => void }>();

	const steps: InfoStep[] = [
		{
			title: 'Welcome to GrappleLang',
			body: 'This is the editor for defining Jiu Jiu game plans'
		}
	];
</script>

<InfoPane {steps} position="top-right" {onDismiss} />
