<script lang="ts">
	import { categories, formatDate, pad } from "#lib/data/posts.ts";
	import { AUTHOR, SITE } from "#lib/data/site.ts";
	import { magnetic, reveal, splitLines } from "#lib/motion/attachments.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import Prose from "#lib/components/ui/Prose.svelte";
	import Icon from "#lib/components/ui/Icon.svelte";
	import VideoPlayer from "#lib/components/blog/VideoPlayer.svelte";
	import SpecSheet from "#lib/components/blog/SpecSheet.svelte";
	import Verdict from "#lib/components/blog/Verdict.svelte";

	let { data } = $props();

	const post = $derived(data.post);
	const url = $derived(`${SITE}/blog/${post.slug}`);
	const image = $derived(`${SITE}${post.cover}`);
	const jsonLd = $derived(
		JSON.stringify([
			{
				"@context": "https://schema.org",
				"@type": "Review",
				name: post.seoTitle,
				description: post.description,
				datePublished: post.date,
				dateModified: post.updated ?? post.date,
				inLanguage: "fr-FR",
				author: { "@type": "Person", name: AUTHOR, url: SITE },
				publisher: { "@type": "Person", name: AUTHOR },
				itemReviewed: { "@type": "Product", name: post.title, image, brand: { "@type": "Brand", name: post.title.split(" ")[0] } },
				...(post.rating && {
					reviewRating: { "@type": "Rating", ratingValue: post.rating.value, bestRating: post.rating.max, worstRating: 0 },
				}),
				image,
				mainEntityOfPage: url,
			},
			...(post.video
				? [
						{
							"@context": "https://schema.org",
							"@type": "VideoObject",
							name: `${post.title} : déballage, installation et mesures`,
							description: post.description,
							thumbnailUrl: `${SITE}${post.video.poster}`,
							contentUrl: `${SITE}${post.video.src}`,
							uploadDate: post.date,
						},
					]
				: []),
			{
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{ "@type": "ListItem", position: 1, name: "Accueil", item: SITE },
					{ "@type": "ListItem", position: 2, name: "Laboratoire", item: `${SITE}/blog` },
					{ "@type": "ListItem", position: 3, name: post.title, item: url },
				],
			},
		]).replace(/</g, "\\u003c"),
	);

	let activeId = $state("");

	function jump(e: MouseEvent, id: string) {
		e.preventDefault();
		getLenis()?.scrollTo(`#${CSS.escape(id)}`, { offset: -100, duration: 1.4 });
	}
</script>

<svelte:head>
	<title>{post.seoTitle}</title>
	<meta name="description" content={post.description} />
	<link rel="canonical" href={url} />
	<meta property="og:title" content={post.seoTitle} />
	<meta property="og:description" content={post.description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content={image} />
	<meta property="article:published_time" content={post.date} />
	<meta property="article:modified_time" content={post.updated ?? post.date} />
	<meta property="article:author" content={AUTHOR} />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

{#key post.slug}
	<article style:--c={post.color}>
		<header class="hero wrap">
			<a href="/blog" class="back label" data-cursor="Labo">
				<Icon name="arrow-left" size={14} /> Laboratoire
			</a>

			<div class="top">
				<div class="big-tile" data-morph={post.slug}>
					<span class="bt-num">{pad(post.number)}</span>
					<span class="bt-year">{new Date(post.date).getFullYear()}</span>
					<span class="bt-sym">{post.symbol}</span>
					<span class="bt-name">{post.title}</span>
					<span class="bt-fam">{categories[post.category].label}</span>
				</div>

				<div class="headline">
					<p class="label meta" {@attach reveal({ delay: 0.2 })}>
						<span style:color={post.color}>Expérience {pad(post.number)}</span> · {categories[post.category].label}
						· {formatDate(post.date)} · {data.minutes} min de lecture
					</p>
					<h1 class="title" {@attach splitLines({ immediate: true, delay: 0.25 })}>{post.title}</h1>
					<p class="summary" {@attach reveal({ delay: 0.4 })}>{post.subtitle}</p>
					<div class="chips" {@attach reveal({ delay: 0.5 })}>
						{#if post.rating}
							<span class="score-chip">
								<b>{post.rating.value.toFixed(1).replace(".", ",")}</b><span class="label">/ {post.rating.max}</span>
							</span>
						{/if}
						<a href="#fiche-technique" class="btn" onclick={(e) => jump(e, "fiche-technique")} {@attach magnetic(0.25)}>
							Fiche technique <Icon name="arrow-down" size={16} />
						</a>
					</div>
				</div>
			</div>

			{#if post.video}
				<div class="film" {@attach reveal({ delay: 0.3, y: 70 })}>
					<VideoPlayer src={post.video.src} poster={post.video.poster} color={post.color} />
					<p class="label text-dust cap">Montage vidéo réalisé avec Remotion · déballage, installation, mesures</p>
				</div>
			{/if}

			<dl class="facts" {@attach reveal({ children: true, stagger: 0.07 })}>
				{#each post.facts as f (f.label)}
					<div>
						<dt class="label text-dust">{f.label}</dt>
						<dd>{f.value}</dd>
					</div>
				{/each}
			</dl>
		</header>

		<div class="body wrap">
			<aside class="toc">
				<p class="label text-dust">Sommaire</p>
				<ol>
					{#each data.toc as entry, i (entry.id)}
						<li>
							<a href={`#${entry.id}`} class:on={activeId === entry.id} onclick={(e) => jump(e, entry.id)}>
								<span class="label">{pad(i + 1)}</span>
								{entry.text}
							</a>
						</li>
					{/each}
				</ol>
			</aside>

			<div class="col">
				<Prose html={data.html} onactive={(id) => (activeId = id)} />

				<section class="block" id="fiche-technique" aria-labelledby="fiche-title">
					<h2 id="fiche-title" class="block-title">Fiche technique</h2>
					<SpecSheet {post} />
					<p class="label text-dust src">Sources des caractéristiques :</p>
					<ul class="sources">
						{#each post.sources as s (s.href)}
							<li><a href={s.href} target="_blank" rel="noreferrer">{s.label} <Icon name="arrow-up-right" size={12} /></a></li>
						{/each}
					</ul>
				</section>

				{#if post.rating}
					<section class="block" id="note" aria-labelledby="note-title">
						<h2 id="note-title" class="block-title">La note</h2>
						<Verdict {post} />
					</section>
				{/if}
			</div>
		</div>

		<nav class="neighbours wrap" aria-label="Autres expériences">
			<a href="/blog" class="all label" data-cursor="Labo">← Toutes les expériences</a>
		</nav>
	</article>
{/key}

<style>
	.hero {
		padding-top: calc(var(--nav-h) + 2rem);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-dust);
		transition:
			color 0.3s,
			gap 0.5s var(--ease-expo);
	}
	.back:hover {
		color: var(--color-bone);
		gap: 0.9rem;
	}
	.top {
		display: grid;
		gap: 2.5rem;
		align-items: end;
		margin-top: 2rem;
	}
	.big-tile {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr auto auto;
		width: clamp(12rem, 22vw, 20rem);
		max-width: 100%;
		aspect-ratio: 1;
		padding: 1.2rem 1.3rem;
		border: 1px solid var(--c);
		border-radius: 1.3rem;
		background:
			radial-gradient(110% 90% at 50% 120%, color-mix(in oklab, var(--c) 40%, transparent), transparent 60%),
			linear-gradient(160deg, color-mix(in oklab, var(--c) 14%, transparent), transparent 55%),
			var(--color-graphite);
		box-shadow: 0 3rem 8rem -3rem color-mix(in oklab, var(--c) 65%, transparent);
	}
	.bt-num,
	.bt-year {
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}
	.bt-num {
		color: var(--c);
	}
	.bt-year {
		color: var(--color-dust);
	}
	.bt-sym {
		grid-column: 1 / -1;
		align-self: center;
		font-size: clamp(5rem, 16vw, 9rem);
		font-weight: 850;
		font-stretch: 125%;
		letter-spacing: -0.05em;
		line-height: 0.9;
	}
	.bt-name {
		grid-column: 1 / -1;
		font-size: 1.05rem;
		font-weight: 600;
	}
	.bt-fam {
		grid-column: 1 / -1;
		margin-top: 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--c);
	}
	.meta {
		color: var(--color-dust);
	}
	.title {
		margin-top: 1rem;
		font-size: clamp(3rem, 9.5vw, 9rem);
		font-weight: 780;
		font-stretch: 118%;
		letter-spacing: -0.045em;
		line-height: 0.88;
		overflow-wrap: anywhere;
	}
	.summary {
		max-width: 40rem;
		margin-top: 1.6rem;
		font-size: clamp(1.1rem, 1.7vw, 1.4rem);
		line-height: 1.55;
		color: color-mix(in oklab, var(--color-bone) 80%, transparent);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem;
		margin-top: 2rem;
	}
	.score-chip {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.55rem 1.1rem;
		border: 1px solid var(--c);
		border-radius: 999px;
		background: color-mix(in oklab, var(--c) 14%, transparent);
	}
	.score-chip b {
		font-size: 1.4rem;
		font-weight: 800;
		font-stretch: 115%;
		letter-spacing: -0.03em;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.9rem 1.25rem;
		border-radius: 999px;
		border: 1px solid var(--line-strong);
		font-weight: 600;
		transition:
			background-color 0.3s,
			color 0.3s,
			border-color 0.3s;
	}
	.btn:hover {
		background: var(--color-bone);
		border-color: var(--color-bone);
		color: var(--color-ink);
	}
	.film {
		margin-top: clamp(3rem, 6vw, 5rem);
	}
	.cap {
		margin-top: 0.9rem;
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem 1rem;
		margin-top: clamp(2.5rem, 5vw, 4rem);
		padding-block: 1.5rem;
		border-block: 1px solid var(--line);
	}
	.facts dd {
		margin-top: 0.4rem;
		font-size: 1.1rem;
		font-weight: 600;
		font-stretch: 105%;
	}

	.body {
		display: grid;
		gap: 3rem;
		padding-block: clamp(4rem, 8vw, 7rem);
	}
	.toc {
		display: none;
	}
	.toc ol {
		display: grid;
		gap: 0.15rem;
		margin-top: 1rem;
	}
	.toc a {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.45rem 0 0.45rem 0.9rem;
		border-left: 1px solid var(--line);
		color: var(--color-dust);
		font-size: 0.9rem;
		line-height: 1.35;
		transition:
			color 0.3s,
			border-color 0.3s,
			padding 0.5s var(--ease-expo);
	}
	.toc a:hover {
		color: var(--color-bone);
	}
	.toc a.on {
		color: var(--color-bone);
		border-color: var(--c);
		padding-left: 1.3rem;
	}
	.toc a .label {
		color: var(--c);
		font-size: 0.55rem;
	}
	.col {
		min-width: 0;
		max-width: 50rem;
	}
	.block {
		margin-top: 4.5rem;
		scroll-margin-top: 6rem;
	}
	.block-title {
		margin-bottom: 1.8rem;
		padding-top: 1.4rem;
		border-top: 1px solid var(--line);
		font-size: clamp(1.8rem, 3.2vw, 2.7rem);
		font-weight: 720;
		font-stretch: 112%;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.src {
		margin-top: 2rem;
	}
	.sources {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.2rem;
		margin-top: 0.6rem;
		font-size: 0.85rem;
	}
	.sources a {
		display: inline-flex;
		gap: 0.3rem;
		align-items: center;
		color: var(--color-dust);
		text-decoration: underline;
		text-decoration-color: var(--c);
		text-underline-offset: 0.2em;
		transition: color 0.3s;
	}
	.sources a:hover {
		color: var(--color-bone);
	}
	.neighbours {
		margin-bottom: clamp(4rem, 8vw, 6rem);
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}
	.all {
		color: var(--color-dust);
		transition: color 0.3s;
	}
	.all:hover {
		color: var(--c);
	}

	@media (min-width: 900px) {
		.top {
			grid-template-columns: auto 1fr;
			gap: 4rem;
		}
		.facts {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	@media (min-width: 1100px) {
		.body {
			grid-template-columns: 16rem 1fr;
			gap: 5rem;
		}
		.toc {
			display: block;
			position: sticky;
			top: calc(var(--nav-h) + 2rem);
			align-self: start;
			max-height: calc(100svh - var(--nav-h) - 4rem);
			overflow-y: auto;
		}
	}
</style>
