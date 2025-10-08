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

	let { value = '', language = 'javascript' } = $props();

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
</script>

<div
	class="h-full min-h-[300px] flex-1 rounded border border-zinc-800 dark:border-zinc-700"
	bind:this={host}
></div>

<style>
	.cm-editor {
		height: 100%;
	}
	.cm-scroller {
		height: 100%;
		overflow: auto;
	}
</style>
