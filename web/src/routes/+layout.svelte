<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeSwitch from '$lib/components/theme-switch.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { BottomNav, BottomNavItem, Tooltip } from 'flowbite-svelte';
	import { EditOutline, HomeOutline, HomeSolid, ShareNodesOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	import { replaceAll } from '@codemirror/search';

	let { children } = $props();

	let activeUrl = $state(page.url.pathname);
	let iconClass =
		'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white';
	$effect(() => {
		activeUrl = page.url.pathname;
	});
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

<div class="app-shell dark:bg-chisel-900 bg-white text-zinc-900 dark:text-zinc-100">
	<div class="flex">
		<!-- Desktop Nav -->
		<div class="hidden w-[58px] md:block">
			<Sidebar />
		</div>

		<!-- Mobile Nav -->
		<nav class="md:hidden">
			<BottomNav
				position="absolute"
				navType="application"
				class="z-[99] w-fit"
				classes={{ inner: 'grid-cols-3' }}
			>
				<BottomNavItem
					btnName="Home"
					appBtnPosition="left"
					href="/"
					class={`${activeUrl === '/' ? 'bg-chisel-50' : ''}`}
				>
					<HomeOutline class={iconClass} />
				</BottomNavItem>
				<Tooltip arrow={false}>Home</Tooltip>
				<BottomNavItem
					btnName="Graph"
					appBtnPosition="middle"
					href="/graph"
					class={`${activeUrl === '/graph' ? 'bg-chisel-50' : ''}`}
				>
					<ShareNodesOutline class={iconClass} />
				</BottomNavItem>
				<Tooltip arrow={false}>Graph</Tooltip>
				<BottomNavItem
					btnName="Editor"
					appBtnPosition="right"
					href="/editor"
					class={`${activeUrl === '/editor' ? 'bg-chisel-50' : ''}`}
				>
					<EditOutline class={iconClass} />
				</BottomNavItem>
				<Tooltip arrow={false}>Editor</Tooltip>
			</BottomNav>
		</nav>
		<div class="flex h-screen w-full flex-col">
			<div class="app-toolbar">
				<div>
					<h1 class="m-0 text-lg font-semibold">{activeUrl.replace('/', '')}</h1>
				</div>
				<ThemeSwitch />
			</div>
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.app-shell {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}
	.app-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 24px;
		gap: 8px;
	}
</style>
