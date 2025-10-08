<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { DarkMode } from 'flowbite-svelte';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('light');

	function applyTheme(target: 'light' | 'dark') {
		const root = document.documentElement;
		if (target === 'dark') root.classList.add('dark');
		else root.classList.remove('dark');
	}

	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('theme');
		let initial: 'light' | 'dark';
		if (saved === 'light' || saved === 'dark') {
			initial = saved as 'light' | 'dark';
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			initial = prefersDark ? 'dark' : 'light';
		}
		applyTheme(initial);
		theme = initial;
	}

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		applyTheme(theme);
		if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
	}
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
		<DarkMode
			onclick={toggleTheme}
			class="text-primary-500 dark:text-primary-600 border dark:border-gray-800"
		/>
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
	.theme-toggle {
		font: inherit;
		background: transparent;
		border: 1px solid currentColor;
		border-radius: 6px;
		padding: 6px 10px;
		cursor: pointer;
	}
</style>
