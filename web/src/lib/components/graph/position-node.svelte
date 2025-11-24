<script lang="ts">
	import type { PositionModifier } from '@lang/types';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge, type BadgeProps } from 'flowbite-svelte';
	let { id, data }: NodeProps = $props();
	const { tag, label } = data;
	const tagColor: Record<string, BadgeProps['color']> = {
		a: 'red',
		d: 'blue',
		b: 'green',
		t: 'orange'
	};

	const tagText = {
		a: 'attacking',
		b: 'bottom',
		d: 'defending',
		t: 'top'
	};
</script>

<Handle type="target" position={Position.Bottom} />
<div class="flex flex-col gap-1 border-none">
	{#if tag}
		<Badge
			class="absolute right-1 top-1 p-0.5 text-[6px] opacity-50"
			size="small"
			border
			color={tagColor[tag]}>{tagText[tag]}</Badge
		>
		<div class="h-2"></div>
	{/if}
	<div class="text-xs">{label}</div>
</div>
<Handle type="source" position={Position.Top} />
