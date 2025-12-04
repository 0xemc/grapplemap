<script lang="ts">
	import type { PositionModifier } from '@lang/types';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge, type BadgeProps } from 'flowbite-svelte';
	import type { PositionNodeData } from '../graph.utils';
	type Props = {
		data: PositionNodeData;
	};
	let { id, data }: NodeProps & Props = $props();
	const tagColor: Record<PositionModifier, BadgeProps['color']> = {
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

	let { label, modifier, tags } = $derived(data);
	const img = $derived(tags?.find((t) => t.includes('img:'))?.split('img:')[1]);
	const icon = $derived(tags?.find((t) => t.includes('icon:'))?.split('icon:')[1]);
</script>

<Handle type="target" position={Position.Bottom} />
<div class="flex h-14">
	{#if img}
		<img
			class="h-14 w-16 rounded-l-xs object-cover object-center"
			src={img}
			alt={label + ' image'}
		/>
	{/if}
	<div class="flex h-full flex-col gap-1 border-none p-[10px]">
		{#if modifier}
			<Badge
				class="absolute top-1 right-1 p-0.5 text-[6px] opacity-50"
				size="small"
				border
				color={tagColor[modifier]}>{tagText[modifier]}</Badge
			>
			<div class="h-4"></div>
		{/if}
		<div class="flex h-full items-center text-xs">{label}</div>
	</div>
</div>
<Handle type="source" position={Position.Top} />
