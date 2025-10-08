<script lang="ts">
	import { onMount } from 'svelte';
	import { currentTheme, toggleTheme, observeTheme, type Theme } from '$lib/theme';
	import { DarkMode } from 'flowbite-svelte';

	let theme = $state<Theme>('light');

	onMount(() => {
		theme = currentTheme();
		const stop = observeTheme((t) => (theme = t));
		return () => stop();
	});
</script>

<DarkMode class="text-primary-500 dark:text-primary-600 dark:border-primary-900 border" />
