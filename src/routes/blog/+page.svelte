<script lang="ts">
	import { onMount } from "svelte";
	import { categories, formatDate, pad, posts, type PostCategory } from "#lib/data/posts.ts";
	import { gsap } from "#lib/motion/gsap.ts";
	import { reveal, splitLines, tilt } from "#lib/motion/attachments.ts";
	import Icon from "#lib/components/ui/Icon.svelte";

	let filter = $state<PostCategory | null>(null);
	const shown = $derived(posts.filter((p) => !filter || p.category === filter).toReversed());
	const count = (c: PostCategory) => posts.filter((p) => p.category === c).length;
	const used = $derived((Object.keys(categories) as PostCategory[]).filter(count));

	let grid = $state<HTMLElement>();
	onMount(() => {
		if (!grid) return;
		const tween = gsap.from(grid.querySelectorAll("[data-card]"), {
			opacity: 0,
			y: 80,
			scale: 0.94,
			duration: 1.4,
			ease: "expo.out",
			stagger: 0.12,
			delay: 0.4,
		});
		return () => tween.kill();
	});
</script>

<svelte:head>
	<link rel="canonical" href="https://sudo-rahman.fr/blog" />
	<title>Laboratoire : tests et présentations — Rahman Yilmaz</title>
	<meta
		name="description"
		content="Le carnet de labo de Rahman Yilmaz : tests de matériel, présentations de produits, montages vidéo et mesures."
	/>
	<meta property="og:title" content="Laboratoire — Rahman Yilmaz" />
	<meta property="og:url" content="https://sudo-rahman.fr/blog" />
</svelte:head>

<section class="head wrap">
	<p class="label text-dust" {@attach reveal()}>03 — Laboratoire</p>
	<h1 class="title" {@attach splitLines({ immediate: true, delay: 0.1 })}>
		Carnet<br />de labo.
	</h1>
	<div class="intro">
		<p class="lead" {@attach reveal({ delay: 0.3 })}>
			Des tests de matériel, des présentations de produits et leurs mesures. Chaque expérience a son numéro,
			sa vidéo et sa note.
		</p>
		<div class="filters" role="group" aria-label="Filtrer par type" {@attach reveal({ delay: 0.4, children: true, stagger: 0.05 })}>
			<button class="chip" class:on={filter === null} onclick={() => (filter = null)}>
				Tout <span class="n">{posts.length}</span>
			</button>
			{#each used as c (c)}
				<button class="chip" class:on={filter === c} onclick={() => (filter = filter === c ? null : c)}>
					{categories[c].plural} <span class="n">{count(c)}</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<section class="wrap list" aria-label="Expériences" bind:this={grid}>
	{#each shown as p, i (p.slug)}
		<a
			href={`/blog/${p.slug}`}
			class="card"
			class:lead-card={i === 0}
			style:--c={p.color}
			data-card
			data-cursor="Lire"
			data-cursor-color={p.color}
		>
			<div class="media" {@attach tilt(3)}>
				<img src={p.cover} alt="" loading="eager" />
				<div class="shade"></div>
				{#if p.rating}
					<span class="score"><b>{p.rating.value.toFixed(1).replace(".", ",")}</b> / {p.rating.max}</span>
				{/if}
			</div>
			<div class="info">
				<div class="tile" data-morph={p.slug}>
					<span class="t-num">{pad(p.number)}</span>
					<span class="t-sym">{p.symbol}</span>
				</div>
				<div class="txt">
					<p class="label text-dust">
						<span style:color={p.color}>{categories[p.category].label}</span> · {formatDate(p.date)}
					</p>
					<h2 class="c-title">{p.title}</h2>
					<p class="c-sum">{p.excerpt}</p>
				</div>
				<Icon name="arrow-up-right" size={26} class="arrow" />
			</div>
		</a>
	{/each}

	<div class="card pending" data-card aria-label="Prochaine expérience">
		<div class="tile ghost"><span class="t-num">{pad(posts.length + 1)}</span><span class="t-sym">?</span></div>
		<div class="txt">
			<p class="label text-dust">En cours de synthèse</p>
			<h2 class="c-title">Prochaine expérience</h2>
			<p class="c-sum">Un nouveau produit sur la paillasse. Déballage, mesures et verdict bientôt ici.</p>
		</div>
	</div>
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
		border-color: var(--color-bone);
	}
	.chip.on {
		background: var(--color-bone);
		border-color: var(--color-bone);
		color: var(--color-ink);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		opacity: 0.65;
	}

	.list {
		display: grid;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		padding-bottom: clamp(5rem, 10vw, 9rem);
	}
	.card {
		--c: var(--color-dust);
		display: grid;
		gap: 1.4rem;
		align-content: start;
	}
	.media {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border: 1px solid var(--line-strong);
		border-radius: 1.3rem;
		background: var(--color-graphite);
		transition:
			border-color 0.4s,
			box-shadow 0.6s var(--ease-expo);
	}
	.card:hover .media {
		border-color: var(--c);
		box-shadow: 0 3rem 8rem -3rem color-mix(in oklab, var(--c) 70%, transparent);
	}
	.media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 1.4s var(--ease-expo);
	}
	.card:hover .media img {
		transform: scale(1.06);
	}
	.shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgb(9 9 11 / 0.55), transparent 50%);
	}
	.score {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--c);
		border-radius: 999px;
		background: rgb(9 9 11 / 0.7);
		backdrop-filter: blur(8px);
		font-family: var(--font-mono);
		font-size: 0.7rem;
	}
	.score b {
		font-size: 1rem;
		color: var(--c);
	}
	.info {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 1.4rem;
		align-items: start;
	}
	.tile {
		position: relative;
		display: grid;
		place-items: center;
		width: clamp(4.6rem, 8vw, 6.4rem);
		aspect-ratio: 1;
		border: 1px solid color-mix(in oklab, var(--c) 55%, transparent);
		border-radius: 0.8rem;
		background: var(--color-graphite);
		transition:
			border-color 0.4s,
			transform 0.7s var(--ease-expo),
			box-shadow 0.5s;
	}
	.card:hover .tile {
		border-color: var(--c);
		transform: rotate(-5deg) scale(1.06);
		box-shadow: 0 1.5rem 4rem -1.5rem var(--c);
	}
	.t-num {
		position: absolute;
		top: 0.45rem;
		left: 0.55rem;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--c);
	}
	.t-sym {
		margin-top: 0.4rem;
		font-size: clamp(1.8rem, 3.4vw, 2.6rem);
		font-weight: 850;
		font-stretch: 120%;
		letter-spacing: -0.04em;
	}
	.txt {
		display: grid;
		gap: 0.6rem;
		min-width: 0;
	}
	.c-title {
		font-size: clamp(1.5rem, 3.2vw, 2.6rem);
		font-weight: 700;
		font-stretch: 112%;
		letter-spacing: -0.03em;
		line-height: 1;
	}
	.c-sum {
		max-width: 44rem;
		color: var(--color-dust);
		line-height: 1.55;
	}
	.card :global(.arrow) {
		display: none;
		color: var(--color-dust);
		transition:
			transform 0.6s var(--ease-expo),
			color 0.3s;
	}
	.card:hover :global(.arrow) {
		color: var(--c);
		transform: rotate(45deg);
	}
	.pending {
		grid-template-columns: auto 1fr;
		align-items: center;
		padding: 1.6rem;
		border: 1px dashed var(--line-strong);
		border-radius: 1.3rem;
	}
	.ghost {
		border-style: dashed;
		color: var(--color-dust);
	}
	.ghost .t-sym {
		color: var(--color-dust);
	}
	@media (min-width: 900px) {
		.intro {
			grid-template-columns: 1fr auto;
		}
		.list {
			grid-template-columns: repeat(2, 1fr);
		}
		.lead-card {
			grid-column: 1 / -1;
		}
		.lead-card .c-title {
			font-size: clamp(2.4rem, 5vw, 4.4rem);
		}
		.card :global(.arrow) {
			display: block;
		}
	}
</style>
