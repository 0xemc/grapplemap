<script lang="ts">
	import { page } from '$app/state';
	import logoPng from '$lib/assets/logo.png';
	import logoSvg from '$lib/assets/logo.svg';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { BottomNav, BottomNavItem, Tooltip } from 'flowbite-svelte';
	import { EditOutline, ShareNodesOutline } from 'flowbite-svelte-icons';
	import { Toaster } from 'svelte-sonner';
	import '../app.css';

	let { children } = $props();
	let activeUrl = $state(page.url.pathname);
	let iconClass =
		'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white';

	$effect(() => {
		activeUrl = page.url.pathname;
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={logoSvg} />
	<link rel="icon" type="image/png" sizes="32x32" href={logoPng} />
	<link rel="apple-touch-icon" href={logoPng} />
	<link rel="mask-icon" href={logoSvg} color="#FF813F" />
	<link rel="shortcut icon" href="/favicon.ico" />
	<script>
		(function () {
			try {
				// var saved = localStorage.getItem('theme');
				// var pref = saved
				// 	? saved
				// 	: window.matchMedia('(prefers-color-scheme: dark)').matches
				// 		? 'dark'
				// 		: 'light';
				// if (pref === 'dark') document.documentElement.classList.add('dark');
				// else document.documentElement.classList.remove('dark');
				document.documentElement.classList.remove('dark');
			} catch (e) {}
		})();
	</script>
	<script
		data-name="BMC-Widget"
		data-cfasync="false"
		src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
		data-id="grapplemap"
		data-description="Support me on Buy me a coffee!"
		data-color="#FF813F"
		data-position="Right"
		data-x_margin="18"
		data-y_margin="18"
	></script>
</svelte:head>

<div class="app-shell dark:bg-chisel-900 bg-white text-zinc-900 dark:text-zinc-100">
	<div class="flex">
		<!-- Desktop Nav -->
		<div class="hidden w-[58px] md:block">
			<Sidebar />
		</div>

		<!-- Mobile Nav -->
		<nav class="md:hidden">
			<!-- <a href="/" class="border-chisel-100 absolute left-2 top-2 z-10 rounded border bg-white">
				<img src={logo} alt="logo" class=" h-10 w-10 p-2" />
			</a> -->
			<BottomNav
				position="absolute"
				navType="application"
				class="z-40 h-14 w-fit rounded-xl"
				classes={{ inner: 'grid-cols-2 h-full' }}
			>
				<!-- <BottomNavItem
					btnName="Home"
					appBtnPosition="left"
					href="/"
					class={`${activeUrl === '/' ? 'bg-chisel-50' : ''}`}
				>
					<HomeOutline class={iconClass} />
				</BottomNavItem> -->
				<Tooltip arrow={false}>Home</Tooltip>
				<BottomNavItem
					btnName="Graph"
					appBtnPosition="middle"
					href="/graph"
					class={`${activeUrl === '/graph' ? 'bg-chisel-50' : ''} rounded-l-xl`}
				>
					<ShareNodesOutline class={iconClass} />
				</BottomNavItem>
				<Tooltip arrow={false}>Graph</Tooltip>
				<BottomNavItem
					btnName="Editor"
					appBtnPosition="right"
					href="/editor"
					class={`${activeUrl === '/editor' ? 'bg-chisel-50' : ''} rounded-r-xl`}
				>
					<EditOutline class={iconClass} />
				</BottomNavItem>
				<Tooltip arrow={false}>Editor</Tooltip>
			</BottomNav>
		</nav>
		<div class="flex h-screen w-full flex-col">
			<!-- <div class="app-toolbar">
				<div>
					<h1 class="m-0 text-lg font-semibold">{activeUrl.replace('/', '')}</h1>
				</div>
			<ThemeSwitch /> 
			</div> -->
			{@render children?.()}
		</div>
	</div>
</div>
<Toaster position="top-center" richColors />

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
