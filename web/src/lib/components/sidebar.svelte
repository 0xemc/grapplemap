<script lang="ts">
	import { Sidebar, SidebarGroup, SidebarItem, uiHelpers, SidebarBrand } from 'flowbite-svelte';
	import { EditOutline, HomeOutline, ShareNodesOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	let activeUrl = $state(page.url.pathname);
	const spanClass = 'flex-1 whitespace-nowrap';
	const { isOpen, close } = uiHelpers();
	let isDemoOpen = $state(false);
	import logo from '$lib/assets/logo.svg';
	$effect(() => {
		isDemoOpen = isOpen;
		activeUrl = page.url.pathname;
	});
	const site = {
		href: '/',
		img: logo
	};
</script>

<Sidebar
	{activeUrl}
	backdrop={false}
	isOpen={isDemoOpen}
	closeSidebar={close}
	params={{ x: -50, duration: 50 }}
	class="border-chisel-200 z-40 h-full w-auto border-r bg-white pt-1 dark:border-zinc-700"
	classes={{ nonactive: 'p-2', active: 'p-2' }}
>
	<SidebarBrand {site} class="ml-auto mr-auto w-8 p-0" />
	<SidebarGroup>
		<!-- <SidebarItem href="/" {spanClass}>
			{#snippet icon()}
				<HomeOutline
					class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
				/>
			{/snippet}
		</SidebarItem> -->
		<SidebarItem href="/graph" {spanClass}>
			{#snippet icon()}
				<ShareNodesOutline
					class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
				/>
			{/snippet}
		</SidebarItem>
		<SidebarItem href="/editor" {spanClass}>
			{#snippet icon()}
				<EditOutline
					class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
				/>
			{/snippet}
		</SidebarItem>
	</SidebarGroup>
</Sidebar>
