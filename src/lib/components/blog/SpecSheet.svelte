<script lang="ts">
	import { reveal } from "#lib/motion/attachments.ts";
	import type { Post } from "#lib/data/posts.ts";

	let { post }: { post: Post } = $props();
</script>

<div class="sheet">
	{#each post.specs as group, gi (group.group)}
		<section {@attach reveal({ y: 36, delay: gi * 0.05 })}>
			<h3 class="label">{group.group}</h3>
			<dl>
				{#each group.rows as row (row.label)}
					<div class="row">
						<dt>{row.label}</dt>
						<dd>{row.value}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/each}
</div>

<style>
	.sheet {
		display: grid;
		gap: 2rem;
	}
	h3 {
		padding-bottom: 0.7rem;
		border-bottom: 1px solid var(--line-strong);
		color: var(--c);
	}
	.row {
		position: relative;
		display: grid;
		gap: 0.2rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--line);
		transition: padding 0.5s var(--ease-expo);
	}
	.row:hover {
		padding-left: 0.8rem;
	}
	dt {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-dust);
	}
	dd {
		font-weight: 550;
		line-height: 1.4;
	}
	@media (min-width: 700px) {
		.row {
			grid-template-columns: 12rem 1fr;
			gap: 1.5rem;
			align-items: baseline;
		}
	}
</style>
