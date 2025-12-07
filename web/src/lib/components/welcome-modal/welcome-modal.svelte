<script lang="ts">
	import Modal from '@components/modal.svelte';
	import { Badge, Button } from 'flowbite-svelte';
	import { WELCOME_OPTIONS } from './welcome-modal.constants';
	import { badgeColorFor, isYouTubeUrl } from './welcome-modal.utils';
	import type { WelcomeChoice } from './welcome-modal.types';

	let {
		open = false,
		embedUrl = '',
		description = 'Choose a starting point. You can switch anytime in settings.',
		onClose,
		onSelect
	}: {
		open?: boolean;
		embedUrl?: string;
		description?: string;
		onClose?: () => void;
		onSelect?: (choice: WelcomeChoice) => void;
	} = $props();

	function select(choice: WelcomeChoice) {
		onSelect?.(choice);
		onClose?.();
	}
	const isYouTube = $derived(isYouTubeUrl(embedUrl));
</script>

<svelte:head>
	{#if isYouTube}
		<link rel="preconnect" href="https://www.youtube.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://i.ytimg.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://s.ytimg.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://www.google.com" crossorigin="anonymous" />
	{/if}
</svelte:head>

<Modal {open} {onClose} panelClass="relative mx-4 w-full max-w-3xl rounded-lg bg-white">
	{#if embedUrl}
		<div class="relative w-full" style="aspect-ratio: 16/9;">
			<iframe
				class="h-full w-full rounded-t-lg"
				src={embedUrl}
				loading="eager"
				title="Welcome video"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen
			></iframe>
		</div>
	{/if}

	<div class="flex flex-col gap-4 p-4">
		<h2 class="text-lg font-bold">Welcome to GrappleMap</h2>
		<p class="text-sm text-gray-700">{description}</p>

		<div class="flex flex-col gap-3">
			{#each WELCOME_OPTIONS as opt}
				<Button
					color="light"
					size="sm"
					class="group flex w-full flex-col items-start rounded-md border border-gray-200 !p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
					onclick={() => select(opt.choice)}
				>
					<div class="mb-1 flex w-full justify-between">
						<span class="font-semibold">{opt.title}</span>
						<Badge color={badgeColorFor(opt.level)} size="small">{opt.level}</Badge>
					</div>
					<p class="text-xs text-gray-600">{opt.description}</p>
				</Button>
			{/each}
		</div>

		<div class="mt-2">
			<Button size="xs" onclick={() => onClose?.()}>Close</Button>
		</div>
	</div>
</Modal>
