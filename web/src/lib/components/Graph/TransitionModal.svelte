<script lang="ts">
	import { Button, Modal, P } from 'flowbite-svelte';
	import { getGraphContext } from './state.svelte';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	let graph = getGraphContext();

	// One liveQuery for the whole table
	let transitions = liveQuery(() => db.transitions.toArray());

	// Purely derived from in-memory data + current selection
	let transition = $derived(
		($transitions ?? []).find((t) => t.title === graph.selected_transition)
	);

	function extractUrlFromTags(tags: string | undefined | null): string | null {
		if (!tags) return null;
		const m = tags.match(/https?:\/\/[^\s)\]]+/i);
		return m ? m[0] : null;
	}

	function isYouTube(url: string): boolean {
		try {
			const u = new URL(url);
			return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
		} catch {
			return false;
		}
	}

	function toYouTubeEmbedUrl(url: string): string {
		try {
			const u = new URL(url);
			if (u.hostname === 'youtu.be') {
				return `https://www.youtube.com/embed/${u.pathname.replace(/^\//, '')}`;
			}
			if (u.hostname.includes('youtube.com')) {
				if (u.pathname === '/watch') {
					const id = u.searchParams.get('v');
					if (id) return `https://www.youtube.com/embed/${id}`;
				}
				if (u.pathname.startsWith('/shorts/')) {
					const id = u.pathname.split('/')[2];
					if (id) return `https://www.youtube.com/embed/${id}`;
				}
				if (u.pathname.startsWith('/embed/')) return url;
			}
		} catch {}
		return url;
	}

	function isVimeo(url: string): boolean {
		try {
			const u = new URL(url);
			return u.hostname.includes('vimeo.com');
		} catch {
			return false;
		}
	}

	function toVimeoEmbedUrl(url: string): string {
		try {
			const u = new URL(url);
			if (u.hostname === 'player.vimeo.com' && u.pathname.startsWith('/video/')) return url;
			// vimeo.com/{id}
			const id = u.pathname.replace(/^\//, '').split('/')[0];
			if (id) return `https://player.vimeo.com/video/${id}`;
		} catch {}
		return url;
	}

	function isDirectVideo(url: string): boolean {
		try {
			const u = new URL(url);
			const pathname = u.pathname.toLowerCase();
			return pathname.endsWith('.mp4') || pathname.endsWith('.webm') || pathname.endsWith('.ogg');
		} catch {
			return false;
		}
	}

	let url = $derived(extractUrlFromTags(transition?.tags));
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
			<P><b>Tags</b>: {transition.tags}</P>
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
