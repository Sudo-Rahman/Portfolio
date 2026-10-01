<script lang="ts">
	import type { Family } from "#lib/data/elements.ts";
	import { tableLayout } from "#lib/data/elements.ts";
	import { elements, featuredProjects, type Project } from "#lib/data/projects.ts";
	import Tile from "./Tile.svelte";
	import TilePanel from "./TilePanel.svelte";

	let {
		filter = null,
		fitHeight = false,
		el = $bindable(),
	}: {
		filter?: Family | null;
		/** Constrain tile size so the whole table fits in the viewport. */
		fitHeight?: boolean;
		el?: HTMLElement;
	} = $props();

	const layout = tableLayout(elements);
	const rows = layout.years.length;
	// The legend panel sits in the empty top-left corner, like on a real periodic table.
	const panelFits = !layout.cells.some((c) => c.row <= 2 && c.col <= 4);

	let current = $state<Project>(featuredProjects[0]);
</script>

<div
	class="table"
	class:fit={fitHeight}
	style:--cols={layout.columns}
	style:--rows={rows}
	bind:this={el}
>
	<!-- Desktop: true periodic layout -->
	<div class="grid">
		{#each layout.blocks as block (block.family.id)}
			<div
				class="block-head"
				class:dim={filter && filter !== block.family.id}
				style:grid-column={`${block.start + 1} / span ${block.span}`}
				style:--c={block.family.color}
			>
				<span class="label">{block.family.label}</span>
				<span class="label flame">{block.span > 1 ? block.family.flame : block.family.flameSymbol}</span>
			</div>
		{/each}

		{#each layout.years as year, i (year)}
			<div class="period" style:grid-row={i + 2}>
				<span class="label">{year}</span>
				<span class="label p">P{i + 1}</span>
			</div>
		{/each}

		{#if panelFits}
			<div class="panel-slot" style:grid-row="2 / span 2" style:grid-column="2 / span 4">
				<TilePanel project={current} />
			</div>
		{/if}

		{#each layout.cells as cell (cell.project.slug)}
			<Tile
				project={cell.project}
				style={`grid-row:${cell.row + 1};grid-column:${cell.col + 1};order:${cell.project.number}`}
				dim={!!filter && filter !== cell.project.family}
				active={current.slug === cell.project.slug}
				onactivate={(p) => (current = p)}
			/>
		{/each}
	</div>
</div>

<style>
	.table {
		--gap: clamp(4px, 0.55vw, 9px);
		--tile: calc((min(100vw, 90rem) - 2 * var(--gutter) - 3.2rem - var(--cols) * var(--gap)) / var(--cols));
		width: 100%;
	}
	.table.fit {
		--tile: min(
			calc((min(100vw, 90rem) - 2 * var(--gutter) - 3.2rem - var(--cols) * var(--gap)) / var(--cols)),
			calc((100svh - 16.5rem) / (var(--rows) + 0.6))
		);
	}
	.grid {
		display: grid;
		grid-template-columns: 2.6rem repeat(var(--cols), var(--tile));
		grid-template-rows: auto repeat(var(--rows), var(--tile));
		gap: var(--gap);
		justify-content: center;
		perspective: 1200px;
	}
	.block-head {
		align-self: end;
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--c);
		transition: opacity 0.5s;
		overflow: hidden;
		white-space: nowrap;
	}
	.block-head .label {
		font-size: 0.6rem;
	}
	.block-head .flame {
		color: var(--c);
	}
	.block-head.dim {
		opacity: 0.25;
	}
	.period {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.25rem;
		color: var(--color-dust);
	}
	.period .label {
		font-size: 0.55rem;
	}
	.period .p {
		color: var(--color-ash);
	}
	.panel-slot {
		position: relative;
		padding: 0 calc(var(--gap) * 2) calc(var(--gap) * 2) 0;
	}

	/* Below 1024px the table reflows into a dense grid in atomic order */
	@media (max-width: 1023px) {
		.grid {
			--tile: calc((100vw - 2 * var(--gutter) - 3 * var(--gap)) / 4);
			grid-template-columns: repeat(4, 1fr);
			grid-template-rows: none;
			grid-auto-rows: auto;
		}
		.grid > :global(.tile) {
			grid-row: auto !important;
			grid-column: auto !important;
		}
		.block-head,
		.period,
		.panel-slot {
			display: none;
		}
	}
	@media (min-width: 600px) and (max-width: 1023px) {
		.grid {
			--tile: calc((100vw - 2 * var(--gutter) - 5 * var(--gap)) / 6);
			grid-template-columns: repeat(6, 1fr);
		}
	}
	/* When the table must fit the viewport, cap the tile size by the available height too. */
	@media (max-width: 599px) {
		.fit .grid {
			--tile: min(
				calc((100vw - 2 * var(--gutter) - 3 * var(--gap)) / 4),
				calc((100svh - 15rem) / 6 - var(--gap))
			);
			grid-template-columns: repeat(4, var(--tile));
			justify-content: center;
		}
	}
	@media (min-width: 600px) and (max-width: 1023px) {
		.fit .grid {
			--tile: min(
				calc((100vw - 2 * var(--gutter) - 5 * var(--gap)) / 6),
				calc((100svh - 15rem) / 4 - var(--gap))
			);
			grid-template-columns: repeat(6, var(--tile));
			justify-content: center;
		}
	}
</style>
