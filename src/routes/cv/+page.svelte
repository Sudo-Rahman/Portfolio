<script lang="ts">
	import { onMount } from "svelte";
	import { profile, skills } from "#lib/data/cv.ts";
	import { familyById } from "#lib/data/elements.ts";
	import { projects } from "#lib/data/projects.ts";
	import { spectralLines } from "#lib/data/spectrum.ts";
	import { ScrollTrigger } from "#lib/motion/gsap.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import { magnetic, reveal, splitLines } from "#lib/motion/attachments.ts";
	import Spectrum from "#lib/components/cv/Spectrum.svelte";
	import Icon from "#lib/components/ui/Icon.svelte";

	let active = $state<string | null>(null);
	let list: HTMLOListElement;

	const projectByTitle = new Map(projects.map((p) => [p.title, p]));

	onMount(() => {
		const triggers = [...list.querySelectorAll<HTMLElement>("[data-line]")].map((el) =>
			ScrollTrigger.create({
				trigger: el,
				start: "top 60%",
				end: "bottom 60%",
				onToggle: (self) => self.isActive && (active = el.dataset.line!),
			}),
		);
		return () => triggers.forEach((t) => t.kill());
	});

	function select(id: string) {
		getLenis()?.scrollTo(`#${id}`, { offset: -220, duration: 1.4 });
	}
</script>

<svelte:head>
	<title>Parcours — Rahman Yilmaz</title>
	<meta
		name="description"
		content="Parcours de Rahman Yilmaz : alternance Android & Full Stack chez Sweepin, développement freelance, édition de logiciels, Master Informatique BDIA."
	/>
	<meta property="og:title" content="Parcours — Rahman Yilmaz" />
	<meta property="og:url" content="https://sudo-rahman.fr/cv" />
</svelte:head>

<section class="head wrap">
	<p class="label text-dust" {@attach reveal()}>02 — Parcours</p>
	<h1 class="title" {@attach splitLines({ immediate: true, delay: 0.1 })}>Spectre<br />d'émission.</h1>
	<div class="intro">
		<p class="lead" {@attach reveal({ delay: 0.3 })}>
			{profile.headline}, basé à {profile.location}. Le temps est projeté sur le spectre visible&nbsp;: 2020
			brille en violet, aujourd'hui en rouge. Chaque raie est une expérience ou un diplôme.
		</p>
		<div class="actions" {@attach reveal({ delay: 0.4, children: true })}>
			<a class="btn primary" href="/Rahman_YILMAZ_CV.pdf" download {@attach magnetic(0.25)}>
				<Icon name="download" size={18} /> CV en PDF
			</a>
			<a class="btn" href={`mailto:${profile.email}`} {@attach magnetic(0.25)}>
				<Icon name="mail" size={18} /> {profile.email}
			</a>
		</div>
	</div>
</section>

<div class="meter">
	<div class="wrap">
		<div class="m-desktop">
			<Spectrum lines={spectralLines} {active} compact onselect={select} />
		</div>
		<div class="m-mobile">
			<Spectrum lines={spectralLines} {active} compact showLabels={false} />
		</div>
	</div>
</div>

<section class="wrap entries" aria-label="Expériences et formations">
	<ol bind:this={list}>
		{#each spectralLines as line (line.id)}
			<li id={line.id} data-line={line.id} class="entry" class:on={active === line.id} style:--c={line.color}>
				<div class="lambda" {@attach reveal({ y: 30 })}>
					<span class="nm display">{line.nm}<small>nm</small></span>
					<span class="swatch"></span>
					<span class="label text-dust">{line.kind === "experience" ? "Expérience" : "Formation"}</span>
				</div>
				<div class="content" {@attach reveal({ y: 30, delay: 0.1 })}>
					<p class="label period">{line.period} · {line.location}</p>
					<h2 class="e-title">{line.title}</h2>
					<p class="e-sub">{line.subtitle}</p>
					{#if line.highlights.length}
						<ul class="highlights">
							{#each line.highlights as h (h)}
								<li>{h}</li>
							{/each}
						</ul>
					{/if}
					{#if line.products.length}
						<div class="products">
							<p class="label text-dust">Produits livrés</p>
							<ul>
								{#each line.products as name (name)}
									{@const p = projectByTitle.get(name)}
									<li>
										{#if p}
											<a
												href={`/projects/${p.slug}`}
												class="chip linked"
												style:--f={familyById[p.family].color}
												data-cursor={p.symbol}
												data-cursor-color={familyById[p.family].color}
											>
												<b>{p.symbol}</b>
												{name}
											</a>
										{:else}
											<span class="chip">{name}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>

<section class="wrap skills" aria-labelledby="skills-title">
	<header class="sec-head">
		<h2 id="skills-title" class="label text-dust">Composition chimique</h2>
		<p class="label text-dust">{skills.length} réactifs</p>
	</header>
	<dl>
		{#each skills as skill, i (skill.label)}
			<div class="skill" {@attach reveal({ y: 24, delay: i * 0.04 })}>
				<dt>
					<span class="label text-dust">{String(i + 1).padStart(2, "0")}</span>
					{skill.label}
				</dt>
				<dd>
					{#each skill.details.split(", ") as item (item)}
						<span class="tag">{item}</span>
					{/each}
				</dd>
			</div>
		{/each}
	</dl>
</section>

<style>
	.head {
		padding-top: calc(var(--nav-h) + clamp(3rem, 8vw, 6rem));
		padding-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.title {
		margin-top: 1.5rem;
		font-size: clamp(3.2rem, 11vw, 10.5rem);
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
		max-width: 36rem;
		color: var(--color-dust);
		line-height: 1.6;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
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
	.btn.primary {
		background: var(--color-bone);
		color: var(--color-ink);
	}
	.btn:hover {
		background: var(--color-desktop);
		border-color: var(--color-desktop);
		color: var(--color-ink);
	}
	.meter {
		position: sticky;
		top: 0;
		z-index: 20;
		padding-top: calc(var(--nav-h) + 0.25rem);
		padding-bottom: 0.5rem;
		margin-top: calc(-1 * var(--nav-h));
		background: var(--color-ink);
	}
	.meter::after {
		content: "";
		position: absolute;
		inset: 100% 0 auto;
		height: 2.5rem;
		background: linear-gradient(var(--color-ink), transparent);
		pointer-events: none;
	}
	.m-mobile {
		display: none;
	}
	.entries {
		padding-block: 3rem clamp(5rem, 10vw, 8rem);
	}
	.entry {
		display: grid;
		gap: 1.5rem;
		padding-block: clamp(2.5rem, 5vw, 4rem);
		border-bottom: 1px solid var(--line);
		transition: opacity 0.5s;
	}
	.lambda {
		display: grid;
		gap: 0.75rem;
		align-content: start;
	}
	.nm {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		font-size: clamp(3.2rem, 7vw, 6rem);
		color: var(--c);
		transition: text-shadow 0.6s;
	}
	.entry.on .nm {
		text-shadow: 0 0 40px color-mix(in oklab, var(--c) 60%, transparent);
	}
	.nm small {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--color-dust);
	}
	.swatch {
		width: 100%;
		max-width: 12rem;
		height: 4px;
		border-radius: 2px;
		background: var(--c);
		box-shadow: 0 0 18px var(--c);
		transform: scaleX(0.3);
		transform-origin: left;
		transition: transform 0.8s var(--ease-expo);
	}
	.entry.on .swatch {
		transform: scaleX(1);
	}
	.period {
		color: var(--c);
	}
	.e-title {
		margin-top: 0.75rem;
		font-size: clamp(1.6rem, 3.2vw, 2.8rem);
		font-weight: 720;
		font-stretch: 110%;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.e-sub {
		margin-top: 0.4rem;
		font-size: 1.1rem;
		color: var(--color-dust);
	}
	.highlights {
		display: grid;
		gap: 0.75rem;
		margin-top: 1.75rem;
		max-width: 48rem;
	}
	.highlights li {
		position: relative;
		padding-left: 1.4rem;
		line-height: 1.6;
		color: color-mix(in oklab, var(--color-bone) 80%, transparent);
	}
	.highlights li::before {
		content: "";
		position: absolute;
		left: 0.15rem;
		top: 0.7em;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 8px var(--c);
	}
	.products {
		display: grid;
		gap: 0.75rem;
		margin-top: 2rem;
	}
	.products ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 500;
	}
	.chip.linked {
		border-color: color-mix(in oklab, var(--f) 50%, transparent);
		transition:
			background-color 0.3s,
			color 0.3s;
	}
	.chip.linked b {
		color: var(--f);
		font-weight: 800;
	}
	.chip.linked:hover {
		background: var(--f);
		color: var(--color-ink);
	}
	.chip.linked:hover b {
		color: var(--color-ink);
	}

	.skills {
		padding-bottom: clamp(5rem, 10vw, 8rem);
	}
	.sec-head {
		display: flex;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--line);
	}
	.skill {
		display: grid;
		gap: 1rem;
		padding-block: 1.5rem;
		border-bottom: 1px solid var(--line);
	}
	.skill dt {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		font-size: clamp(1.3rem, 2.4vw, 2rem);
		font-weight: 680;
		font-stretch: 110%;
		letter-spacing: -0.02em;
	}
	.skill dd {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.tag {
		padding: 0.35rem 0.7rem;
		border-radius: 0.4rem;
		background: var(--color-graphite);
		border: 1px solid var(--line);
		font-size: 0.85rem;
		transition:
			border-color 0.3s,
			color 0.3s;
	}
	.tag:hover {
		border-color: var(--color-desktop);
		color: var(--color-desktop);
	}

	@media (min-width: 900px) {
		.intro {
			grid-template-columns: 1fr auto;
		}
		.entry {
			grid-template-columns: 18rem 1fr;
			gap: 3rem;
		}
		.skill {
			grid-template-columns: 22rem 1fr;
			align-items: baseline;
		}
	}
	@media (max-width: 767px) {
		.m-desktop {
			display: none;
		}
		.m-mobile {
			display: block;
		}
	}
</style>
