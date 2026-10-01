<script lang="ts">
	import { familyById, stateLabels } from "#lib/data/elements.ts";
	import { pad } from "#lib/data/projects.ts";
	import { gsap, ScrollTrigger } from "#lib/motion/gsap.ts";
	import { magnetic, reveal, splitLines } from "#lib/motion/attachments.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import BohrAtom from "#lib/components/element/BohrAtom.svelte";
	import Icon, { type IconName } from "#lib/components/ui/Icon.svelte";

	let { data } = $props();

	const project = $derived(data.project);
	const family = $derived(familyById[project.family]);
	const links = $derived(
		[
			project.websiteUrl && { href: project.websiteUrl, label: "Site du produit", icon: "globe" },
			project.appStoreUrl && { href: project.appStoreUrl, label: "App Store", icon: "apple" },
			project.url && { href: project.url, label: "Code source", icon: "github" },
		].filter(Boolean) as { href: string; label: string; icon: IconName }[],
	);

	/** Orbital label of the n-th technology, matching the shells drawn by BohrAtom. */
	function shellOf(index: number): string {
		if (index < 2) return "1s";
		if (index < 8) return "2p";
		return "3d";
	}

	let activeId = $state("");

	/** Reveals report figures and tracks which section is being read. */
	function proseEffects(prose: HTMLElement) {
		activeId = "";
		const figures = ScrollTrigger.batch(prose.querySelectorAll(".figure"), {
			start: "top 90%",
			once: true,
			onEnter: (batch) =>
				gsap.fromTo(
					batch,
					{ clipPath: "inset(18% 8% 18% 8% round 1rem)", opacity: 0.2 },
					{ clipPath: "inset(0% 0% 0% 0% round 1rem)", opacity: 1, duration: 1.4, ease: "expo.out" },
				),
		});
		const h2s = [...prose.querySelectorAll<HTMLElement>("h2[id]")];
		const headings = h2s.map((h, i) =>
			ScrollTrigger.create({
				trigger: h,
				start: "top 40%",
				endTrigger: h2s[i + 1] ?? undefined,
				end: h2s[i + 1] ? "top 40%" : "max",
				onToggle: (self) => {
					if (self.isActive) activeId = h.id;
					else if (activeId === h.id && self.direction < 0 && i === 0) activeId = "";
				},
			}),
		);
		// Lazy images change the page height: re-measure once they arrive.
		let pending = 0;
		const remeasure = () => {
			clearTimeout(pending);
			pending = window.setTimeout(() => ScrollTrigger.refresh(), 150);
		};
		prose.addEventListener("load", remeasure, true);
		return () => {
			clearTimeout(pending);
			prose.removeEventListener("load", remeasure, true);
			figures.forEach((t) => t.kill());
			headings.forEach((t) => t.kill());
		};
	}

	function jump(e: MouseEvent, id: string) {
		e.preventDefault();
		getLenis()?.scrollTo(`#${CSS.escape(id)}`, { offset: -100, duration: 1.4 });
	}
</script>

<svelte:head>
	<title>{project.symbol} · {project.title} — Rahman Yilmaz</title>
	<meta name="description" content={project.summary} />
	<meta property="og:title" content={`${project.title} — Rahman Yilmaz`} />
	<meta property="og:description" content={project.summary} />
	<meta property="og:url" content={`https://sudo-rahman.fr/projects/${project.slug}`} />
	<meta property="og:type" content="article" />
</svelte:head>

{#key project.slug}
<article style:--c={family.color}>
	<header class="hero wrap">
		<a href="/projects" class="back label" data-cursor="Tableau">
			<Icon name="arrow-left" size={14} /> Tableau périodique
		</a>

		<div class="hero-grid">
			<div class="card-col">
				<div class="big-tile" data-morph={project.slug}>
					<span class="bt-num">{pad(project.number)}</span>
					<span class="bt-year">{project.year}</span>
					<span class="bt-sym">{project.symbol}</span>
					<span class="bt-name">{project.title}</span>
					<span class="bt-fam">{family.label} · flamme {family.flame.toLowerCase()}</span>
				</div>
			</div>
			<div class="atom-col" {@attach reveal({ delay: 0.3 })}>
				<BohrAtom technologies={project.technologies} color={family.color} symbol={project.symbol} />
			</div>
		</div>

		<div class="headline">
			<p class="label meta" {@attach reveal({ delay: 0.2 })}>
				<span style:color={family.color}>Élément {pad(project.number)}</span> · {family.label} · {project.year}
				· {stateLabels[project.state]}
			</p>
			<h1 class="title" {@attach splitLines({ immediate: true, delay: 0.25 })}>{project.title}</h1>
			<div class="lead-row">
				<p class="summary" {@attach reveal({ delay: 0.4 })}>{project.summary}</p>
				{#if links.length}
					<div class="links" {@attach reveal({ delay: 0.5, children: true })}>
						{#each links as link (link.href)}
							<a href={link.href} target="_blank" rel="noreferrer" class="btn" {@attach magnetic(0.25)}>
								<Icon name={link.icon} size={18} />
								{link.label}
								<Icon name="arrow-up-right" size={16} />
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="config" {@attach reveal({ delay: 0.2 })}>
			<p class="label text-dust">Configuration électronique</p>
			<ul>
				{#each project.technologies as tech, i (tech)}
					<li>
						<span class="shell">{shellOf(i)}</span>
						{tech}
					</li>
				{/each}
			</ul>
		</div>
	</header>

	<div class="body wrap">
		{#if data.toc.length}
			<aside class="toc">
				<p class="label text-dust">Sommaire</p>
				<ol>
					{#each data.toc as entry, i (entry.id)}
						<li>
							<a
								href={`#${entry.id}`}
								class:on={activeId === entry.id}
								onclick={(e) => jump(e, entry.id)}
							>
								<span class="label">{pad(i + 1)}</span>
								{entry.text}
							</a>
						</li>
					{/each}
				</ol>
			</aside>
		{/if}
		<div class="prose" {@attach proseEffects}>
			{@html data.html}
		</div>
	</div>

	<nav class="neighbours wrap" aria-label="Éléments voisins">
		{#each [{ p: data.prev, dir: "prev" }, { p: data.next, dir: "next" }] as n (n.dir)}
			{#if n.p}
				{@const f = familyById[n.p.family]}
				<a
					href={`/projects/${n.p.slug}`}
					class={`nb ${n.dir}`}
					style:--c={f.color}
					data-cursor={n.p.symbol}
					data-cursor-color={f.color}
				>
					<span class="label text-dust">
						{n.dir === "prev" ? "← Élément précédent" : "Élément suivant →"}
					</span>
					<span class="nb-tile" data-morph={n.p.slug}>
						<span class="nb-num">{pad(n.p.number)}</span>
						<span class="nb-sym">{n.p.symbol}</span>
					</span>
					<span class="nb-title">{n.p.title}</span>
				</a>
			{:else}
				<div class={`nb empty ${n.dir}`}>
					<span class="label text-dust">
						{n.dir === "prev" ? "Premier élément du tableau" : "Dernier élément synthétisé"}
					</span>
				</div>
			{/if}
		{/each}
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
	.hero-grid {
		display: grid;
		gap: 2rem;
		align-items: center;
		margin-top: 2rem;
	}
	.big-tile {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr auto auto;
		width: clamp(15rem, 26vw, 26rem);
		max-width: 100%;
		aspect-ratio: 1;
		padding: 1.4rem 1.5rem;
		border: 1px solid var(--c);
		border-radius: 1.4rem;
		background:
			radial-gradient(110% 90% at 50% 120%, color-mix(in oklab, var(--c) 40%, transparent), transparent 60%),
			linear-gradient(160deg, color-mix(in oklab, var(--c) 14%, transparent), transparent 55%),
			var(--color-graphite);
		box-shadow: 0 3rem 8rem -3rem color-mix(in oklab, var(--c) 65%, transparent);
	}
	.bt-num,
	.bt-year {
		font-family: var(--font-mono);
		font-size: 0.95rem;
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
		font-size: clamp(6rem, 22vw, 11rem);
		font-weight: 850;
		font-stretch: 125%;
		letter-spacing: -0.05em;
		line-height: 0.9;
	}
	.bt-name {
		grid-column: 1 / -1;
		font-size: 1.15rem;
		font-weight: 600;
	}
	.bt-fam {
		grid-column: 1 / -1;
		margin-top: 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--c);
	}
	.atom-col {
		width: min(100%, 44rem);
		justify-self: center;
	}
	.headline {
		margin-top: clamp(2.5rem, 6vw, 4rem);
	}
	.meta {
		color: var(--color-dust);
	}
	.title {
		margin-top: 1rem;
		font-size: clamp(3rem, 11vw, 10.5rem);
		font-weight: 780;
		font-stretch: 118%;
		letter-spacing: -0.045em;
		line-height: 0.88;
		overflow-wrap: anywhere;
	}
	.lead-row {
		display: grid;
		gap: 2rem;
		margin-top: clamp(2rem, 4vw, 3rem);
	}
	.summary {
		max-width: 46rem;
		font-size: clamp(1.1rem, 1.7vw, 1.4rem);
		line-height: 1.55;
		color: color-mix(in oklab, var(--color-bone) 80%, transparent);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-content: start;
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
	.btn:first-child {
		background: var(--c);
		border-color: var(--c);
		color: var(--color-ink);
	}
	.btn:hover {
		background: var(--color-bone);
		border-color: var(--color-bone);
		color: var(--color-ink);
	}
	.config {
		display: grid;
		gap: 1rem;
		margin-top: clamp(3rem, 6vw, 5rem);
		padding-block: 1.5rem;
		border-block: 1px solid var(--line);
	}
	.config ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
	}
	.config li {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		font-size: 1.05rem;
		font-weight: 550;
	}
	.shell {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--c);
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

	/* Report typography */
	.prose {
		min-width: 0;
		max-width: 50rem;
		font-size: clamp(1rem, 1.2vw, 1.1rem);
		line-height: 1.7;
		color: color-mix(in oklab, var(--color-bone) 82%, transparent);
	}
	.prose :global(h2) {
		margin: 4.5rem 0 1.4rem;
		padding-top: 1.4rem;
		border-top: 1px solid var(--line);
		font-size: clamp(1.8rem, 3.2vw, 2.7rem);
		font-weight: 720;
		font-stretch: 112%;
		letter-spacing: -0.03em;
		line-height: 1.05;
		color: var(--color-bone);
		scroll-margin-top: 6rem;
	}
	.prose :global(h2:first-child) {
		margin-top: 0;
	}
	.prose :global(h3) {
		margin: 2.6rem 0 0.9rem;
		font-size: clamp(1.2rem, 1.8vw, 1.5rem);
		font-weight: 650;
		font-stretch: 106%;
		color: var(--color-bone);
	}
	.prose :global(h4) {
		margin: 2rem 0 0.6rem;
		font-weight: 650;
		color: var(--color-bone);
	}
	.prose :global(p) {
		margin: 1rem 0;
	}
	.prose :global(strong) {
		color: var(--color-bone);
		font-weight: 650;
	}
	.prose :global(a) {
		color: var(--color-bone);
		text-decoration: underline;
		text-decoration-color: var(--c);
		text-underline-offset: 0.2em;
		text-decoration-thickness: 1px;
		transition: color 0.3s;
	}
	.prose :global(a:hover) {
		color: var(--c);
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 1rem 0;
		padding-left: 1.3rem;
	}
	.prose :global(ul) {
		list-style: none;
		padding-left: 0;
	}
	.prose :global(ul > li) {
		position: relative;
		padding-left: 1.4rem;
	}
	.prose :global(ul > li::before) {
		content: "";
		position: absolute;
		left: 0.2rem;
		top: 0.72em;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 8px var(--c);
	}
	.prose :global(ol) {
		list-style: decimal;
	}
	.prose :global(li) {
		margin: 0.45rem 0;
	}
	.prose :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8em;
		padding: 0.12em 0.4em;
		border-radius: 0.3rem;
		background: var(--color-slate);
		color: color-mix(in oklab, var(--c) 60%, var(--color-bone));
	}
	.prose :global(pre) {
		margin: 1.5rem 0;
		padding: 1.25rem 1.4rem;
		border: 1px solid var(--line);
		border-radius: 0.8rem;
		background: var(--color-graphite);
		overflow-x: auto;
		font-size: 0.82rem;
		line-height: 1.6;
	}
	.prose :global(pre code) {
		padding: 0;
		background: none;
		color: var(--color-bone);
	}
	.prose :global(blockquote) {
		margin: 1.5rem 0;
		padding: 0.4rem 0 0.4rem 1.25rem;
		border-left: 2px solid var(--c);
		color: var(--color-bone);
		font-style: italic;
	}
	.prose :global(.figure) {
		display: block;
		margin: 2.5rem 0;
	}
	.prose :global(.figure img) {
		display: block;
		width: 100%;
		border-radius: 1rem;
		border: 1px solid var(--line);
	}
	.prose :global(.caption) {
		display: block;
		margin-top: 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-dust);
	}
	.prose :global(.table-scroll) {
		margin: 1.5rem 0;
		overflow-x: auto;
		border: 1px solid var(--line);
		border-radius: 0.8rem;
	}
	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.88rem;
	}
	.prose :global(th),
	.prose :global(td) {
		padding: 0.7rem 0.9rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--line);
	}
	.prose :global(th) {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-dust);
		background: var(--color-graphite);
	}
	.prose :global(tr:last-child td) {
		border-bottom: 0;
	}
	.prose :global(hr) {
		margin: 3rem 0;
		border: 0;
		border-top: 1px solid var(--line);
	}

	.neighbours {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1px;
		margin-bottom: clamp(4rem, 8vw, 6rem);
		border-top: 1px solid var(--line);
	}
	.nb {
		display: grid;
		gap: 1.2rem;
		align-content: start;
		padding: 2rem 0;
	}
	.nb.next {
		justify-items: end;
		text-align: right;
	}
	.nb-tile {
		position: relative;
		display: grid;
		place-items: center;
		width: clamp(6rem, 14vw, 9rem);
		aspect-ratio: 1;
		border: 1px solid color-mix(in oklab, var(--c) 40%, transparent);
		border-radius: 0.9rem;
		background: var(--color-graphite);
		transition:
			border-color 0.4s,
			transform 0.7s var(--ease-expo),
			box-shadow 0.5s;
	}
	.nb:hover .nb-tile {
		border-color: var(--c);
		transform: rotate(-4deg) scale(1.05);
		box-shadow: 0 1.5rem 4rem -1.5rem var(--c);
	}
	.nb-num {
		position: absolute;
		top: 0.6rem;
		left: 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--c);
	}
	.nb-sym {
		font-size: clamp(2.4rem, 5vw, 3.6rem);
		font-weight: 850;
		font-stretch: 120%;
		letter-spacing: -0.04em;
	}
	.nb-title {
		font-size: clamp(1.1rem, 2vw, 1.6rem);
		font-weight: 650;
		font-stretch: 108%;
	}

	@media (min-width: 900px) {
		.hero-grid {
			grid-template-columns: auto 1fr;
			gap: 4rem;
		}
		.lead-row {
			grid-template-columns: 1fr auto;
			align-items: start;
		}
		.links {
			flex-direction: column;
			align-items: stretch;
		}
		.config {
			grid-template-columns: 14rem 1fr;
			align-items: baseline;
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
