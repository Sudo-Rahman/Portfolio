<script lang="ts">
	type Props = {
		class?: string;
		hover?: boolean;
		children: import("svelte").Snippet;
	};

	let { class: className = "", hover = true, children }: Props = $props();
</script>

<div
	class="glass rounded-xl {hover ? 'glass-hover cursor-pointer' : ''} {className}"
>
	{@render children()}
</div>
