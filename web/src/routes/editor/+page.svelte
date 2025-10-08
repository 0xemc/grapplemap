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

		const state = EditorState.create({
			doc: `// Welcome to the editor\nfunction hello(name) {\n  console.log('Hello, ' + name);\n}\nhello('world');\n`,
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
				javascript({ typescript: false }),
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

<div class="page">
	<div class="toolbar">
		<h1>Editor</h1>
	</div>
	<div class="editor" bind:this={host}></div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 16px;
		gap: 12px;
		box-sizing: border-box;
	}
	.toolbar h1 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}
	.editor {
		flex: 1;
		min-height: 300px;
		border: 1px solid #2a2a2a;
	}
</style>
