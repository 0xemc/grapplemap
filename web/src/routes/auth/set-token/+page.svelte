<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		const token = (typeof location !== 'undefined' && location.hash?.slice(1)) || '';
		if (token) {
			try {
				localStorage.setItem('upload_token', token);
			} catch {
				// ignore
			}
		}
		// Redirect back to home (or editor) after storing the token
		goto('/');
	});
</script>

<div class="p-4 text-sm text-zinc-400">
	Setting upload token...
	<script>
		// Keep the element non-empty for hydration
	</script>
</div>
