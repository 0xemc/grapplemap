<script lang="ts">
	import FileTree from '$lib/components/FileTree/FileTree.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';

	const initialDoc = `// Welcome to the editor\nfunction hello(name) {\n  console.log('Hello, ' + name);\n}\nhello('world');\n`;
</script>

<div class="box-border flex h-full flex-col gap-3 p-4">
	<div>
		<h1 class="m-0 text-lg font-semibold">Editor</h1>
	</div>
	<div class="flex gap-3">
		<FileTree />
		<CodeEditor value={initialDoc} language="javascript" />
	</div>
</div>
