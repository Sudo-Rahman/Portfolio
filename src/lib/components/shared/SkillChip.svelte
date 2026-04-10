<script lang="ts">
	type Props = {
		label: string;
		class?: string;
	};

	let { label, class: className = "" }: Props = $props();
</script>

<span
	class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full
	bg-primary/10 text-primary border border-primary/20
	transition-all duration-300 hover:bg-primary/20 hover:border-primary/40 hover:scale-105
	{className}"
>
	{label}
</span>
