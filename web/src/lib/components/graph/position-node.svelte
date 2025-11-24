<script lang="ts">
	import type { PositionModifier } from '@lang/types';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge, type BadgeProps } from 'flowbite-svelte';
	import type { PositionNodeData } from './graph.utils';
	type Props = {
		data: PositionNodeData;
	};
	let { id, data }: NodeProps & Props = $props();
	const { modifier, label, tags } = data;
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

	const img = tags?.find((t) => t.includes('img:'))?.split('img:')[1];
	const icon = tags?.find((t) => t.includes('icon:'))?.split('icon:')[1];
</script>

<Handle type="target" position={Position.Bottom} />
<div class="flex">
	{#if img}
		<img class="h-14 w-16 rounded-l object-cover object-center" src={img} alt={label + ' image'} />
	{/if}
	<div class="flex h-full flex-col gap-1 border-none p-[10px]">
		{#if modifier}
			<Badge
				class="absolute right-1 top-1 p-0.5 text-[6px] opacity-50"
				size="small"
				border
				color={tagColor[modifier]}>{tagText[modifier]}</Badge
			>
			<div class="h-2"></div>
		{/if}
		<div class="h-full text-xs">{label}</div>
	</div>
</div>
<Handle type="source" position={Position.Top} />
