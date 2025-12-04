<script>
	import Onboarding from '@features/onboarding/onboarding.svelte';
	import CodeEditor from '../../features/code-editor/code-editor.svelte';
	import { setCodeEditorContext } from '../../features/code-editor/code-editor.svelte.ts';
	setCodeEditorContext();
</script>

<div class="box-border flex h-full max-h-full flex-col gap-3 p-4">
	<CodeEditor />
	<Onboarding feature="editor" />
</div>
