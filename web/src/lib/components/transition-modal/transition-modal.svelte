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
	import Modal from '@components/modal.svelte';
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

<Modal
	open={context.modal}
	panelClass="relative mx-4 w-full max-w-5xl rounded-lg border-chisel-200 bg-white"
	onClose={() => context.closeModal()}
>
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
			<h2 class="pb-3 text-lg font-bold">{transition?.title ?? 'Transition'}</h2>
		{/if}
		{#if transition?.steps?.length}
			{#each Array.from({ length: Math.ceil(transition.steps.length / 3) }) as _, groupIndex}
				<div class="flex w-fit items-center" class:mt-3={groupIndex !== 0}>
					<div class="left-2 bg-white pl-1 text-xs font-bold">
						{String.fromCharCode(65 + groupIndex)}
					</div>
					<div class="flex pl-4">
						<div class="w-2 rounded-l-md border-b-2 border-l-2 border-t-2 border-gray-300"></div>
						<ol
							class="flex-1 -translate-x-2 list-inside list-decimal py-1"
							start={groupIndex * 3 + 1}
						>
							{#each transition.steps.slice(groupIndex * 3, groupIndex * 3 + 3) as step}
								<li class="ml-1 pl-3">{step}</li>
							{/each}
						</ol>
					</div>
				</div>
			{/each}
		{/if}

		{#if !transition}
			<P>No transition selected.</P>
		{/if}

		<div class="mt-4">
			<Button size="xs" onclick={() => context.closeModal()}>Close</Button>
		</div>
	</div>
</Modal>

<style>
</style>
