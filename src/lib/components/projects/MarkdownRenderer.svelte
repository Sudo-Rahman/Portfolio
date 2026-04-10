<script lang="ts">
	import { marked } from "marked";

	type Props = {
		content: string;
	};

	let { content }: Props = $props();
	let html = $derived(marked(content) as string);
</script>

<div class="prose-custom">
	{@html html}
</div>
