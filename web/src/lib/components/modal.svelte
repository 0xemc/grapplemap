<script lang="ts">
	export let open: boolean = false;
	export let panelClass: string = 'relative mx-4 w-full max-w-lg rounded-lg bg-white';
	export let closeOnBackdrop: boolean = true;
	export let backdropAriaLabel: string = 'Close modal backdrop';

	// Svelte 5: prefer explicit callback props over deprecated event dispatcher
	export let onClose: (() => void) | undefined;

	function requestClose() {
		onClose?.();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!open}>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/60"
			role="button"
			tabindex="0"
			aria-label={backdropAriaLabel}
			onclick={() => {
				if (closeOnBackdrop) requestClose();
			}}
			onkeydown={(e) => {
				if (!closeOnBackdrop) return;
				if (e.key === 'Enter' || e.key === ' ') requestClose();
			}}
		></div>

		<!-- Panel -->
		<div class={panelClass}>
			<slot />
		</div>
	</div>
{/if}

<style>
</style>
