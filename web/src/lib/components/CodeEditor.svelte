<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, keymap, highlightActiveLine } from '@codemirror/view';
	import { EditorState, Compartment } from '@codemirror/state';
	import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
	import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
	import { lintKeymap } from '@codemirror/lint';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { javascript } from '@codemirror/lang-javascript';
	import { ohmHighlighter } from '$lib/utils/ohmHighlighter';
	import { debugParse, traceTransition } from '$lib/utils/transitionParser';

	let { value = '', language = 'transition' } = $props();

	let host: HTMLDivElement | null = null;
	let view: EditorView | null = null;
	const themeCompartment = new Compartment();

	function isDark() {
		return document.documentElement.classList.contains('dark');
	}

	function currentThemeExt() {
		return isDark() ? oneDark : [];
	}

	onMount(() => {
		if (!host) return;

		const langExt = language === 'javascript' ? javascript({ typescript: false }) : [];
		const customLangExt =
			language === 'transition'
				? ohmHighlighter({ grammarURL: '/transition.ohm', startRule: 'blocks' })
				: [];

		const state = EditorState.create({
			doc: value,
			extensions: [
				keymap.of([
					...defaultKeymap,
					...historyKeymap,
					...searchKeymap,
					...completionKeymap,
					...lintKeymap
				]),
				history(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				highlightActiveLine(),
				highlightSelectionMatches(),
				autocompletion(),
				langExt,
				customLangExt,
				themeCompartment.of(currentThemeExt()),
				EditorView.lineWrapping
			]
		});

		view = new EditorView({ state, parent: host });

		const observer = new MutationObserver(() => {
			if (!view) return;
			view.dispatch({ effects: themeCompartment.reconfigure(currentThemeExt()) });
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => {
			observer.disconnect();
			view?.destroy();
			view = null;
		};
	});

	export function setDoc(text: string) {
		if (!view) return;
		const current = view.state.doc.toString();
		if (current === text) return;
		view.dispatch({ changes: { from: 0, to: current.length, insert: text } });
	}

	export function getDoc(): string {
		return view ? view.state.doc.toString() : '';
	}

	// Debug helpers: callable from parent or console
	export async function debugParseDoc() {
		const doc = getDoc();
		return await debugParse(doc);
	}

	export async function parseDoc() {
		const doc = getDoc();
		// return await parseTransitions(doc);
	}

	export async function traceDoc() {
		const doc = getDoc();
		return await traceTransition(doc);
	}
</script>

<div
	class="h-full min-h-[300px] flex-1 rounded border border-zinc-800 dark:border-zinc-700"
	bind:this={host}
></div>
