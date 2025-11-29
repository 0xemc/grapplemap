<script lang="ts">
	import type { NodeProps } from '@xyflow/svelte';
	type Props = {
		data: { label: string; width: number };
	};
	let { id, data }: NodeProps & Props = $props();
	const width = $derived(data?.width ?? 200);
	const label = $derived(String(data?.label ?? ''));
</script>

<div class="pointer-events-none select-none" style={`width:${width}px`}>
	<div class="relative flex items-center">
		<div class="h-px w-full border-t border-dashed border-gray-300"></div>
		<span
			class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white px-1 text-[10px] text-gray-500"
		>
			{label}
		</span>
	</div>
</div>
