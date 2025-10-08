<script>
	import Folder from './Folder.svelte';

	export let files = [
		{
			type: 'folder',
			name: 'Underhook',
			files: [
				{
					type: 'folder',
					name: 'magic',
					files: [
						{ type: 'file', name: '+page.svelte' },
						{ type: 'file', name: 'code.png' }
					]
				},
				{
					type: 'folder',
					name: 'luxe',
					files: [
						{ type: 'file', name: '+page.svelte' },
						{ type: 'file', name: '+layout.svelte' }
					]
				},
				{ type: 'file', name: '+page.svelte' },
				{ type: 'file', name: '+layout.svelte' },
				{ type: 'file', name: '+page.server.ts' }
			]
		}
	];
</script>

<div class="min-w-45 z-50 min-h-64 rounded-lg border border-zinc-800 p-6 dark:border-zinc-700">
	<Folder name="Wrestling" {files} expanded />
</div>
