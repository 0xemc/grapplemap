<script lang="ts">
	import { Button, Modal, P } from 'flowbite-svelte';
	import { getGraphContext } from './state.svelte';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	let graph = getGraphContext();

	// One liveQuery for the whole table
	let transitions = liveQuery(() => db.transitions.toArray());

	// Purely derived from in-memory data + current selection
	let transition = $derived(($transitions ?? []).find((t) => t.title === graph.selected_edge));
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
		{#if transition.steps?.length}
			<P><b>Steps</b>:</P>
			<ul class="list-disc pl-6">
				{#each transition.steps as step}
					<li>{step}</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<P>No transition selected.</P>
	{/if}

	{#snippet footer()}
		<Button onclick={() => graph.closeModal()}>Close</Button>
	{/snippet}
</Modal>
