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
	import { ohmHighlighter } from '$lib/utils/highlighter';
	import { debugParse, traceTransition } from '$lib/utils/transitionParser';
	import { linter, lintGutter } from '@codemirror/lint';
	import { matchTransition } from '$lib/utils/transitionParser';
	import { goto } from '$app/navigation';
	import { uploadFile, sniffFileType, fileToType } from '../../../upload/upload.utils.ts';
	import { toast } from 'svelte-sonner';

	let {
		value = '',
		language = 'transition',
		onDocChanged
	}: {
		value?: string;
		language?: string;
		onDocChanged?: (e: { content: string }) => void;
	} = $props();
	let host: HTMLDivElement | null = null;
	let view: EditorView | null = null;
	const themeCompartment = new Compartment();

	let uploading = $state(false);
	let settingDoc = $state(false);

	function isDark() {
		return document.documentElement.classList.contains('dark');
	}

	function currentThemeExt() {
		return isDark() ? oneDark : [];
	}

	const grammarLint = linter(async (view) => {
		const text = view.state.doc.toString();
		const m = await matchTransition(text);
		if (!m.failed()) return [];

		const interval = m.getInterval?.();
		const from = interval?.startIdx ?? 0;
		const to = Math.min(from + 1, view.state.doc.length);
		return [
			{
				from,
				to,
				severity: 'error',
				message: m.message ?? 'Syntax error'
			}
		];
	});

	onMount(() => {
		if (!host) return;

		const langExt = language === 'javascript' ? javascript({ typescript: false }) : [];
		const customLangExt = language === 'transition' ? ohmHighlighter({ startRule: 'blocks' }) : [];

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
				EditorView.lineWrapping,
				lintGutter(),
				grammarLint,
				// Notify parent when the document changes (autosave hook)
				EditorView.updateListener.of((v) => {
					if (!v.docChanged) return;
					if (settingDoc) return;
					onDocChanged?.({ content: v.state.doc.toString() });
				}),
				EditorView.domEventHandlers({
					paste: (event, view) => {
						(async () => {
							const cd = event.clipboardData;
							const files = [
								...(cd?.files ? Array.from(cd.files) : []),
								...((cd?.items ? Array.from(cd.items) : [])
									.map((i) => (i.kind === 'file' ? i.getAsFile() : null))
									.filter(Boolean) as File[])
							].filter((f) => f && f.size > 0) as File[];

							if (!files.length) return false;

							event.preventDefault();
							const file = files[0];
							uploading = true;
							let type;

							try {
								type = await fileToType(file);
							} catch (e) {
								toast.error('Unsupported file type', {
									duration: 2000
								});
								throw e;
							}

							const url = await uploadFile(file, type);

							const { from, to } = view.state.selection.main;
							if (!url) throw new Error('upload failed');
							view.dispatch({ changes: { from, to, insert: `[url:${url}]` } });
							uploading = false;
						})();
					},
					click: (event, view) => {
						// ctrlKey on Win/Linux, metaKey on macOS
						const isCtrlLike = event.ctrlKey || event.metaKey;
						if (!isCtrlLike) return false;

						// Find word under cursor
						const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
						if (pos == null) return false;
						const line = view.state.doc.lineAt(pos);
						// simple tokenization: match identifier-like token around pos
						const rel = pos - line.from;
						const before = line.text.slice(0, rel);
						const after = line.text.slice(rel);
						const left = before.match(/[A-Za-z0-9_.-]*$/)?.[0] ?? '';
						const right = after.match(/^[A-Za-z0-9_.-]*/)?.[0] ?? '';
						const token = (left + right).trim();
						if (!token) return false;

						// Navigate to graph with edge query
						goto(`/graph?transition=${encodeURIComponent(token)}`);
						return true;
					},
					keydown: (event, view) => {
						if (event.ctrlKey || event.metaKey) view.dom.classList.add('cm-ctrl-like');
						return false;
					},
					keyup: (_event, view) => {
						view.dom.classList.remove('cm-ctrl-like');
						return false;
					},
					blur: (_event, view) => {
						view.dom.classList.remove('cm-ctrl-like');
						return false;
					}
				})
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
		settingDoc = true;
		view.dispatch({ changes: { from: 0, to: current.length, insert: text } });
		settingDoc = false;
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
	class="h-full min-h-[300px] flex-1 overflow-auto rounded border border-zinc-800 dark:border-zinc-700"
	bind:this={host}
></div>
