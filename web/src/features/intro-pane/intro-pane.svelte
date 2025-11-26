<script lang="ts">
	import { onMount } from 'svelte';

	type Step = {
		title: string;
		body: string;
	};

	const STORAGE_KEY = 'grapplemap:intro:dismissed';

	let steps: Step[] = [
		{
			title: 'Welcome to GrappleMap',
			body: 'You can use this graph to visualize and understand positions and transitions in Jiu Jitsu & Grappling.'
		},
		{
			title: 'Positions',
			body: 'Positions (e.g Closed Guard, Mount) are represented as nodes. <br/>Drag them around to re-arrange the graph.'
		},
		{
			title: 'Transitions',
			body: 'Moves are the connections between nodes. <br/>These can be sweeps, takedowns or submissions. Click one to see more detail and/or a video of the move.'
		}
	];

	export let storageKey: string = STORAGE_KEY; // allow override per-surface if needed

	let open = false;
	let stepIndex = 0;

	function markDismissed() {
		try {
			localStorage.setItem(storageKey, '1');
		} catch {
			// ignore storage errors
		}
		open = false;
	}

	function next() {
		if (stepIndex < steps.length - 1) {
			stepIndex += 1;
		} else {
			markDismissed();
		}
	}

	function prev() {
		if (stepIndex > 0) stepIndex -= 1;
	}

	onMount(() => {
		try {
			const dismissed = localStorage.getItem(storageKey) === '1';
			open = !dismissed;
		} catch {
			open = true;
		}
	});
</script>

{#if open}
	<div class="pointer-events-none fixed inset-0 z-40">
		<!-- Panel -->
		<div
			class="pointer-events-auto fixed left-4 top-4 w-[min(380px,calc(100vw-1.5rem))] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur md:left-24 md:top-12 dark:border-slate-700 dark:bg-slate-900/95"
			role="dialog"
			aria-labelledby="intro-title"
		>
			<div class="flex items-start gap-3">
				<div
					class="bg-primary-500/10 text-primary-700 dark:text-primary-300 mt-0.5 shrink-0 rounded-md px-2 py-1 text-xs font-semibold"
				>
					Step {stepIndex + 1}/{steps.length}
				</div>
				<button
					class="-mr-1 ml-auto rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
					aria-label="Dismiss"
					on:click={markDismissed}
				>
					<!-- X icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-5 w-5"
					>
						<path
							fill-rule="evenodd"
							d="M6.72 6.72a.75.75 0 011.06 0L12 10.94l4.22-4.22a.75.75 0 111.06 1.06L13.06 12l4.22 4.22a.75.75 0 11-1.06 1.06L12 13.06l-4.22 4.22a.75.75 0 11-1.06-1.06L10.94 12 6.72 7.78a.75.75 0 010-1.06z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
			<h3 id="intro-title" class="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
				{steps[stepIndex].title}
			</h3>
			<div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
				{@html steps[stepIndex].body}
			</div>

			<div class="mt-4 flex items-center justify-between">
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
					on:click={prev}
					disabled={stepIndex === 0}
				>
					Back
				</button>
				<div class="flex items-center gap-2">
					{#each steps as _, i}
						<div
							class="h-1.5 w-1.5 rounded-full {i === stepIndex
								? 'bg-primary-500'
								: 'bg-slate-300 dark:bg-slate-600'}"
						/>
					{/each}
				</div>
				<button
					class="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 rounded-md px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring"
					on:click={next}
				>
					{stepIndex < steps.length - 1 ? 'Next' : 'Got it'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* minimal safety for very small screens */
	@media (max-width: 380px) {
		:global(.intro-pane) {
			inset: auto 0 0 0;
			margin: 0.75rem;
		}
	}
</style>
