<script lang="ts">
	import { Button, Modal, P } from 'flowbite-svelte';
	import { getGraphContext } from '../graph/graph.state.svelte';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	import {
		extractUrlFromTags,
		isDirectVideo,
		isVimeo,
		isYouTube,
		toVimeoEmbedUrl,
		toYouTubeEmbedUrl
	} from './transition-modal.utils';
	let graph = getGraphContext();

	// One liveQuery for the whole table
	let transitions = liveQuery(() => db.transitions.toArray());

	// Purely derived from in-memory data + current selection
	let transition = $derived(
		($transitions ?? []).find((t) => t.title === graph.selected_transition)
	);
	$effect(() => console.log(transition));

	let url = $derived(extractUrlFromTags(transition?.tags ?? []));
</script>

<Modal
	title={transition?.title ?? 'Transition'}
	bind:open={graph.modal}
	onclose={() => graph.closeModal()}
>
	{#if transition}
		<P><b>From</b>: {transition.from}</P>
		<P><b>To</b>: {transition.to}</P>
		{#if transition.tags}
			<P><b>Tags</b>: {transition.tags.filter((t) => !t.includes('url:'))}</P>
		{/if}
		{#if url}
			{#if isYouTube(url)}
				<div class="w-full" style="aspect-ratio: 16/9;">
					<iframe
						class="h-full w-full"
						src={toYouTubeEmbedUrl(url)}
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
					></iframe>
				</div>
			{:else if isVimeo(url)}
				<div class="w-full" style="aspect-ratio: 16/9;">
					<iframe
						class="h-full w-full"
						src={toVimeoEmbedUrl(url)}
						title="Vimeo video player"
						frameborder="0"
						allow="autoplay; fullscreen; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{:else if isDirectVideo(url)}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video class="w-full" style="max-height: 60vh;" src={url} controls></video>
			{/if}
		{/if}
		{#if transition.steps?.length}
			<P><b>Steps</b>:</P>
			<ol class="list-inside list-decimal pl-6">
				{#each transition.steps as step}
					<li>{step}</li>
				{/each}
			</ol>
		{/if}
	{:else}
		<P>No transition selected.</P>
	{/if}

	{#snippet footer()}
		<Button onclick={() => graph.closeModal()}>Close</Button>
	{/snippet}
</Modal>
