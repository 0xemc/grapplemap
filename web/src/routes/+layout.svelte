<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
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
		<div class="w-[75px]">
			<Sidebar />
		</div>

		<!-- Mobile Nav -->
		<aside class="md:hidden">
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
				<!-- <div class="flex items-center justify-center">
				  <BottomNavItem btnName="Create new item" appBtnPosition="middle" class="bg-primary-600 hover:bg-primary-700 group focus:ring-primary-300 dark:focus:ring-primary-800 inline-flex h-10 w-10 items-center justify-center rounded-full font-medium focus:ring-4 focus:outline-hidden">
					<PlusOutline class="text-white" />
				  </BottomNavItem>
				  <Tooltip arrow={false}>Create new item</Tooltip>
				</div> -->
				<!-- <BottomNavItem btnName="Settings" appBtnPosition="middle">
				  <AdjustmentsVerticalOutline class="group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
				</BottomNavItem>
				<Tooltip arrow={false}>Settings</Tooltip> -->
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
		</aside>
		<div class="flex w-full flex-col">
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
		padding: 8px 12px;
		gap: 8px;
	}
</style>
