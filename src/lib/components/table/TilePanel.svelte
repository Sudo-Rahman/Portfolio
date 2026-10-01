<script lang="ts">
	import { familyById, stateLabels } from "#lib/data/elements.ts";
	import { pad, projectHref, type Project } from "#lib/data/projects.ts";

	let { project }: { project: Project } = $props();

	const family = $derived(familyById[project.family]);
	const href = $derived(projectHref(project));
</script>

<div class="panel" style:--c={family.color}>
	{#key project.slug}
		<div class="big">
			<span class="num">{pad(project.number)}</span>
			<span class="sym">{project.symbol}</span>
		</div>
		<div class="info">
			<p class="label meta">
				<span style:color={family.color}>{family.label}</span> · {project.year} · {stateLabels[project.state]}
			</p>
			<h3 class="title">{project.title}</h3>
			<p class="summary">{project.summary}</p>
			<p class="label stack">{project.technologies.slice(0, 5).join(" · ")}</p>
		</div>
	{/key}
	<p class="label hint">
		{#if href}Cliquez sur un élément pour ouvrir sa fiche{:else}Fiche classée : projet confidentiel{/if}
	</p>
</div>

<style>
	.panel {
		position: relative;
		height: 100%;
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr auto;
		gap: 0.4rem 1.1rem;
		align-items: start;
		container-type: size;
	}
	.big {
		position: relative;
		display: grid;
		place-items: center;
		height: 100%;
		aspect-ratio: 1;
		border-radius: 0.8rem;
		border: 1px solid var(--c);
		background:
			radial-gradient(100% 100% at 50% 110%, color-mix(in oklab, var(--c) 35%, transparent), transparent 70%),
			var(--color-graphite);
		box-shadow: 0 1.5rem 4rem -1.5rem color-mix(in oklab, var(--c) 55%, transparent);
		animation: pop 0.7s var(--ease-expo);
	}
	.big .num {
		position: absolute;
		top: 0.6rem;
		left: 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--c);
	}
	.big .sym {
		font-size: 34cqh;
		font-weight: 850;
		font-stretch: 125%;
		letter-spacing: -0.04em;
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		min-width: 0;
		animation: rise 0.7s var(--ease-expo);
	}
	.meta {
		font-size: 0.6rem;
		color: var(--color-dust);
	}
	.title {
		font-size: clamp(1.1rem, 1.6vw, 1.5rem);
		font-weight: 700;
		font-stretch: 110%;
		letter-spacing: -0.02em;
		line-height: 1.05;
	}
	.summary {
		font-size: 0.78rem;
		line-height: 1.45;
		color: var(--color-dust);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.stack {
		font-size: 0.55rem;
		color: color-mix(in oklab, var(--c) 80%, var(--color-bone));
	}
	.hint {
		grid-column: 1 / -1;
		font-size: 0.55rem;
		color: var(--color-ash);
	}
	@keyframes pop {
		from {
			transform: scale(0.85) rotate(-4deg);
			opacity: 0;
		}
	}
	@keyframes rise {
		from {
			transform: translateY(12px);
			opacity: 0;
		}
	}
</style>
