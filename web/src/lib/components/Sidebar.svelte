<script lang="ts">
	import {
		CloseButton,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarButton,
		uiHelpers
	} from 'flowbite-svelte';
	import { EditOutline, HomeOutline, ShareNodesOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	let activeUrl = $state(page.url.pathname);
	const spanClass = 'flex-1 whitespace-nowrap';
	const { toggle, isOpen, close } = uiHelpers();
	let isDemoOpen = $state(false);
	$effect(() => {
		isDemoOpen = isOpen;
		activeUrl = page.url.pathname;
	});
</script>

<SidebarButton onclick={toggle} class="mb-2" />
<Sidebar
	{activeUrl}
	backdrop={false}
	isOpen={isDemoOpen}
	closeSidebar={close}
	params={{ x: -50, duration: 50 }}
	class="border-chisel-400 z-50 h-full w-auto border-r pt-6 dark:border-zinc-700"
	classes={{ nonactive: 'p-2', active: 'p-2' }}
>
	<CloseButton onclick={close} color="gray" class="absolute right-2 top-2 p-2 md:hidden" />
	<SidebarGroup>
		<SidebarItem href="/" {spanClass}>
			{#snippet icon()}
				<HomeOutline
					class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
				/>
			{/snippet}
		</SidebarItem>
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
