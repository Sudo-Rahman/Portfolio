<script lang="ts">
	import { onMount } from "svelte";
	import { families, familyById, stateLabels, type Family } from "#lib/data/elements.ts";
	import { elements, pad, projectHref } from "#lib/data/projects.ts";
	import { gsap } from "#lib/motion/gsap.ts";
	import { reveal, splitLines } from "#lib/motion/attachments.ts";
	import PeriodicTable from "#lib/components/table/PeriodicTable.svelte";
	import Icon from "#lib/components/ui/Icon.svelte";

	let filter = $state<Family | null>(null);
	let tableEl = $state<HTMLElement>();

	const count = (f: Family) => elements.filter((p) => p.family === f).length;
	const index = $derived(
		[...elements].reverse().filter((p) => !filter || p.family === filter),
	);

	onMount(() => {
		if (!tableEl) return;
		const tween = gsap.from(tableEl.querySelectorAll("[data-tile]"), {
			opacity: 0,
			scale: 0.3,
			rotation: () => gsap.utils.random(-25, 25),
			duration: 1.2,
			ease: "expo.out",
			stagger: { each: 0.035, from: "random" },
			delay: 0.35,
		});
		return () => tween.kill();
	});
</script>

<svelte:head>
	<link rel="canonical" href="https://sudo-rahman.fr/projects" />
	<title>Tableau périodique des projets — Rahman Yilmaz</title>
	<meta
		name="description"
		content="Les 22 projets de Rahman Yilmaz classés comme un tableau périodique : applications mobiles, logiciels desktop, web, data et système."
	/>
	<meta property="og:title" content="Tableau périodique des projets — Rahman Yilmaz" />
	<meta property="og:url" content="https://sudo-rahman.fr/projects" />
</svelte:head>

<section class="head wrap">
	<p class="label text-dust" {@attach reveal()}>01 — Tableau périodique</p>
	<h1 class="title" {@attach splitLines({ immediate: true, delay: 0.1 })}>
		{elements.length} éléments<br />synthétisés.
	</h1>
	<div class="intro">
		<p class="lead" {@attach reveal({ delay: 0.3 })}>
			Chaque projet est un élément. Une ligne par année, un bloc de colonnes par famille, et pour chaque
			famille la couleur de sa flamme. Le numéro atomique suit l'ordre de création.
		</p>
		<div class="filters" role="group" aria-label="Filtrer par famille" {@attach reveal({ delay: 0.4, children: true, stagger: 0.05 })}>
			<button class="chip" class:on={filter === null} onclick={() => (filter = null)}>
				Tous <span class="n">{elements.length}</span>
			</button>
			{#each families as f (f.id)}
				<button
					class="chip"
					class:on={filter === f.id}
					style:--c={f.color}
					onclick={() => (filter = filter === f.id ? null : f.id)}
					title={`Flamme ${f.flame} — ${f.description}`}
				>
					<span class="dot"></span>
					{f.label} <span class="n">{count(f.id)}</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<section class="wrap table-wrap" aria-label="Tableau des projets">
	<PeriodicTable {filter} bind:el={tableEl} />
</section>

<section class="wrap index" aria-labelledby="index-title">
	<header class="sec-head">
		<h2 id="index-title" class="label text-dust">Index des éléments</h2>
		<p class="label text-dust">{index.length} / {elements.length}</p>
	</header>
	<ol>
		{#each index as p (p.slug)}
			{@const f = familyById[p.family]}
			{@const href = projectHref(p)}
			<li {@attach reveal({ y: 24 })}>
				<svelte:element
					this={href ? "a" : "div"}
					{href}
					class="row"
					class:locked={!href}
					style:--c={f.color}
					data-morph={p.slug}
					data-cursor={href ? "Ouvrir" : "Classé"}
					data-cursor-color={f.color}
				>
					<span class="r-num label">{pad(p.number)}</span>
					<span class="r-sym">{p.symbol}</span>
					<span class="r-main">
						<span class="r-title">{p.title}</span>
						<span class="r-sum">{p.summary}</span>
					</span>
					<span class="r-meta label">
						<span style:color={f.color}>{f.label}</span>
						<span class="text-dust">{p.year} · {stateLabels[p.state]}</span>
					</span>
					{#if href}<Icon name="arrow-up-right" size={22} class="r-arrow" />{/if}
				</svelte:element>
			</li>
		{/each}
	</ol>
</section>

<style>
	.head {
		padding-top: calc(var(--nav-h) + clamp(3rem, 8vw, 6rem));
		padding-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.title {
		margin-top: 1.5rem;
		font-size: clamp(3.2rem, 10.5vw, 10rem);
		font-weight: 760;
		font-stretch: 115%;
		letter-spacing: -0.045em;
		line-height: 0.88;
	}
	.intro {
		display: grid;
		gap: 2rem;
		margin-top: clamp(2rem, 4vw, 3rem);
		align-items: end;
	}
	.lead {
		max-width: 34rem;
		color: var(--color-dust);
		line-height: 1.6;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.chip {
		--c: var(--color-bone);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.95rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 550;
		transition:
			background-color 0.3s,
			border-color 0.3s,
			color 0.3s;
	}
	.chip:hover {
		border-color: var(--c);
	}
	.chip.on {
		background: var(--c);
		border-color: var(--c);
		color: var(--color-ink);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 10px var(--c);
	}
	.chip.on .dot {
		background: var(--color-ink);
		box-shadow: none;
	}
	.n {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		opacity: 0.65;
	}
	.table-wrap {
		padding-bottom: clamp(5rem, 10vw, 8rem);
	}
	.index {
		padding-bottom: clamp(5rem, 10vw, 9rem);
	}
	.sec-head {
		display: flex;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--line);
	}
	.row {
		position: relative;
		display: grid;
		grid-template-columns: 2.2rem 3.4rem 1fr auto;
		gap: 1rem;
		align-items: center;
		padding: 1.4rem 0;
		border-bottom: 1px solid var(--line);
		isolation: isolate;
	}
	.row::before {
		content: "";
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(90deg, color-mix(in oklab, var(--c) 16%, transparent), transparent 70%);
		transform: scaleY(0);
		transform-origin: bottom;
		transition: transform 0.6s var(--ease-expo);
	}
	.row:hover::before {
		transform: scaleY(1);
	}
	.r-num {
		color: var(--c);
	}
	.r-sym {
		font-size: 2rem;
		font-weight: 800;
		font-stretch: 112%;
		letter-spacing: -0.03em;
		transition:
			font-stretch 0.6s var(--ease-expo),
			color 0.3s;
	}
	.row:hover .r-sym {
		font-stretch: 125%;
		color: var(--c);
	}
	.r-main {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}
	.r-title {
		font-size: clamp(1.15rem, 2vw, 1.6rem);
		font-weight: 650;
		font-stretch: 108%;
		letter-spacing: -0.02em;
	}
	.r-sum {
		display: none;
		max-width: 48rem;
		color: var(--color-dust);
		font-size: 0.92rem;
		line-height: 1.5;
	}
	.r-meta {
		display: none;
	}
	.row :global(.r-arrow) {
		color: var(--color-dust);
		transition:
			transform 0.6s var(--ease-expo),
			color 0.3s;
	}
	.row:hover :global(.r-arrow) {
		color: var(--c);
		transform: rotate(45deg);
	}
	.locked {
		opacity: 0.7;
	}
	@media (min-width: 900px) {
		.intro {
			grid-template-columns: 1fr auto;
		}
		.filters {
			justify-content: flex-end;
			max-width: 34rem;
		}
		.row {
			grid-template-columns: 3rem 5rem 1fr 11rem 2rem;
			gap: 1.5rem;
		}
		.r-sym {
			font-size: 2.8rem;
		}
		.r-sum {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
		.r-meta {
			display: grid;
			gap: 0.3rem;
		}
	}
	@media (max-width: 899px) {
		.r-main {
			grid-column: 3 / -1;
		}
		.row :global(.r-arrow) {
			display: none;
		}
	}
</style>
