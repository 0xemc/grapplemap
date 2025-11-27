<script lang="ts">
	import { Button, P } from 'flowbite-svelte';
	import { getGraphContext } from '../../../features/graph/graph.state.svelte';
	import { getDbContext } from '$lib/db/context';
	import { liveQuery } from 'dexie';
	import {
		extractUrlFromTags,
		isDirectVideo,
		isVimeo,
		isYouTube,
		toVimeoEmbedUrl,
		toYouTubeEmbedUrl
	} from './transition-modal.utils';
	let context = getGraphContext();
	const db = getDbContext();

	// One liveQuery for the whole table
	let transitions = liveQuery(() => db.transitions.toArray());

	// Purely derived from in-memory data + current selection
	let transition = $derived(($transitions ?? []).find((t) => t.id === context.selected_transition));

	let url = $derived(extractUrlFromTags(transition?.tags ?? []));

	let mediaLoading = $state(false);
	let lastUrl: string | null = null;
	$effect(() => {
		if (url !== lastUrl) {
			lastUrl = url ?? null;
			mediaLoading = !!url;
		}
	});
</script>

<svelte:head>
	{#if url && isYouTube(url)}
		<link rel="preconnect" href="https://www.youtube.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://i.ytimg.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://s.ytimg.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://www.google.com" crossorigin="anonymous" />
	{:else if url && isVimeo(url)}
		<link rel="preconnect" href="https://player.vimeo.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://i.vimeocdn.com" crossorigin="anonymous" />
		<link rel="preconnect" href="https://f.vimeocdn.com" crossorigin="anonymous" />
	{/if}
</svelte:head>

<!-- Keep-mounted modal overlay (prevents iframe unmounting) -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center"
	style={context.modal ? '' : 'visibility:hidden; pointer-events:none;'}
	aria-hidden={!context.modal}
>
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-black/60"
		role="button"
		tabindex="0"
		aria-label="Close modal backdrop"
		onclick={() => context.closeModal()}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') context.closeModal();
		}}
	></div>

	<!-- Panel -->
	<div class="border-chisel-200 relative mx-4 w-full max-w-5xl rounded-lg bg-white">
		{#if transition}
			{#if url}
				{#if isYouTube(url)}
					{#key url}
						<div class="relative w-full" style="aspect-ratio: 16/9;">
							<iframe
								class="h-full w-full rounded-t-lg"
								class:opacity-0={mediaLoading}
								class:pointer-events-none={mediaLoading}
								src={toYouTubeEmbedUrl(url)}
								loading="eager"
								title="YouTube video player"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowfullscreen
								onload={() => (mediaLoading = false)}
							></iframe>
							{#if mediaLoading}
								<div class="absolute inset-0 grid place-items-center rounded-t-lg bg-white">
									<div
										class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
										aria-label="Loading"
									></div>
								</div>
							{/if}
						</div>
					{/key}
				{:else if isVimeo(url)}
					{#key url}
						<div class="relative w-full" style="aspect-ratio: 16/9;">
							<iframe
								class="h-full w-full rounded-t-lg"
								class:opacity-0={mediaLoading}
								class:pointer-events-none={mediaLoading}
								src={toVimeoEmbedUrl(url)}
								loading="eager"
								title="Vimeo video player"
								frameborder="0"
								allow="autoplay; fullscreen; picture-in-picture"
								allowfullscreen
								onload={() => (mediaLoading = false)}
							></iframe>
							{#if mediaLoading}
								<div class="absolute inset-0 grid place-items-center rounded-t-lg bg-white">
									<div
										class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
										aria-label="Loading"
									></div>
								</div>
							{/if}
						</div>
					{/key}
				{:else if isDirectVideo(url)}
					<!-- svelte-ignore a11y_media_has_caption -->
					{#key url}
						<div class="relative w-full">
							<video
								class="w-full rounded-t-lg"
								class:opacity-0={mediaLoading}
								class:pointer-events-none={mediaLoading}
								style="max-height: 60vh;"
								src={url}
								controls
								onloadeddata={() => (mediaLoading = false)}
							></video>
							{#if mediaLoading}
								<div class="absolute inset-0 grid place-items-center rounded-t-lg bg-white">
									<div
										class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
										aria-label="Loading"
									></div>
								</div>
							{/if}
						</div>
					{/key}
				{/if}
			{/if}
		{/if}
		<div class="flex flex-col p-4">
			{#if transition}
				<h2 class="text-lg font-bold">{transition?.title ?? 'Transition'}</h2>
			{/if}
			{#if transition?.steps?.length}
				<ol class="list-inside list-decimal pl-6">
					{#each transition.steps as step}
						<li>{step}</li>
					{/each}
				</ol>
			{/if}

			{#if !transition}
				<P>No transition selected.</P>
			{/if}

			<div class="mt-4">
				<Button size="xs" onclick={() => context.closeModal()}>Close</Button>
			</div>
		</div>
	</div>
</div>

<style>
</style>
