<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		(function () {
			try {
				var saved = localStorage.getItem('theme');
				var pref = saved
					? saved
					: window.matchMedia('(prefers-color-scheme: dark)').matches
						? 'dark'
						: 'light';
				if (pref === 'dark') document.documentElement.classList.add('dark');
				else document.documentElement.classList.remove('dark');
			} catch (e) {}
		})();
	</script>
</svelte:head>

<div class="app-shell bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
	<div class="app-toolbar">
		<ThemeSwitch />
	</div>
	{@render children?.()}
</div>

<style>
	.app-shell {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}
	.app-toolbar {
		display: flex;
		justify-content: flex-end;
		padding: 8px 12px;
		gap: 8px;
	}
</style>
