<script lang="ts">
	import { familyById } from "#lib/data/elements.ts";
	import { pad, projectHref, type Project } from "#lib/data/projects.ts";
	import { tilt } from "#lib/motion/attachments.ts";

	let {
		project,
		dim = false,
		active = false,
		style = "",
		onactivate,
	}: {
		project: Project;
		dim?: boolean;
		active?: boolean;
		style?: string;
		onactivate?: (project: Project) => void;
	} = $props();

	const href = $derived(projectHref(project));
	const color = $derived(familyById[project.family].color);
</script>

<svelte:element
	this={href ? "a" : "div"}
	{href}
	class="tile"
	class:dim
	class:active
	class:featured={project.featured}
	class:locked={!href}
	{style}
	style:--c={color}
	data-tile
	data-family={project.family}
	data-morph={project.slug}
	data-cursor={href ? project.symbol : "Classé"}
	data-cursor-color={color}
	aria-label={`${project.number} ${project.symbol} — ${project.title}`}
	role={href ? undefined : "img"}
	onpointerenter={() => onactivate?.(project)}
	onfocus={() => onactivate?.(project)}
	{@attach tilt(12)}
>
	<span class="num">{pad(project.number)}</span>
	<span class="yr">{project.year}</span>
	<span class="sym">{project.symbol}</span>
	<span class="name">{project.title}</span>
	{#if project.featured}<span class="star" aria-hidden="true"></span>{/if}
</svelte:element>

<style>
	.tile {
		--c: var(--color-bone);
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr auto;
		aspect-ratio: 1;
		padding: 0.45em 0.5em;
		font-size: calc(var(--tile, 6rem) / 7.6);
		border: 1px solid color-mix(in oklab, var(--c) 28%, transparent);
		border-radius: 0.55em;
		background:
			linear-gradient(160deg, color-mix(in oklab, var(--c) 10%, transparent), transparent 55%),
			var(--color-graphite);
		color: var(--color-bone);
		transform-style: preserve-3d;
		transition:
			border-color 0.4s,
			background-color 0.4s,
			box-shadow 0.5s var(--ease-expo);
		will-change: transform;
	}
	.tile::after {
		content: "";
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		background: radial-gradient(120% 90% at 50% 120%, color-mix(in oklab, var(--c) 45%, transparent), transparent 60%);
		opacity: 0;
		transition: opacity 0.5s;
		pointer-events: none;
	}
	.tile:hover,
	.tile.active {
		border-color: var(--c);
		box-shadow:
			0 0 0 1px color-mix(in oklab, var(--c) 40%, transparent),
			0 1.2em 3em -1em color-mix(in oklab, var(--c) 50%, transparent);
		z-index: 2;
	}
	.tile:hover::after,
	.tile.active::after {
		opacity: 1;
	}
	/* Dimming acts on the content so GSAP keeps full control of the tile's own opacity. */
	.tile > * {
		transition:
			opacity 0.5s,
			filter 0.5s;
	}
	.tile.dim {
		border-color: var(--line);
	}
	.tile.dim > * {
		opacity: 0.15;
		filter: grayscale(1);
	}
	.tile.locked {
		background:
			repeating-linear-gradient(-45deg, transparent 0 6px, rgb(255 255 255 / 0.025) 6px 7px),
			var(--color-graphite);
	}
	.num,
	.yr {
		font-family: var(--font-mono);
		font-size: 0.78em;
		color: var(--color-dust);
		line-height: 1;
	}
	.num {
		color: var(--c);
	}
	.sym {
		grid-column: 1 / -1;
		align-self: center;
		font-size: 2.85em;
		font-weight: 720;
		font-stretch: 100%;
		letter-spacing: -0.03em;
		line-height: 1;
		transition:
			font-stretch 0.6s var(--ease-expo),
			font-weight 0.6s var(--ease-expo),
			color 0.4s,
			opacity 0.5s,
			filter 0.5s;
	}
	.tile:hover .sym,
	.tile.active .sym {
		font-stretch: 125%;
		font-weight: 850;
		color: var(--c);
	}
	.name {
		grid-column: 1 / -1;
		font-size: 0.82em;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: color-mix(in oklab, var(--color-bone) 80%, transparent);
	}
	.star {
		position: absolute;
		top: 0.5em;
		right: 0.5em;
		width: 0.45em;
		height: 0.45em;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 0.8em var(--c);
		animation: breathe 2.4s ease-in-out infinite;
	}
	.featured .yr {
		margin-right: 0.9em;
	}
	@keyframes breathe {
		50% {
			opacity: 0.35;
			transform: scale(0.7);
		}
	}
</style>
