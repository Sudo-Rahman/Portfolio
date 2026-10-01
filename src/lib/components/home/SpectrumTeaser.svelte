<script lang="ts">
	import { spectralLines } from "#lib/data/spectrum.ts";
	import { reveal, splitLines } from "#lib/motion/attachments.ts";
	import Spectrum from "#lib/components/cv/Spectrum.svelte";
	import Icon from "#lib/components/ui/Icon.svelte";

	let active = $state<string | null>(spectralLines[0].id);
</script>

<section class="teaser" aria-labelledby="spec-title">
	<div class="wrap">
		<header class="sec-head">
			<p class="label text-dust">04 — Spectre d'émission</p>
			<p class="label text-dust">390 → 700 nm · 2020 → aujourd'hui</p>
		</header>

		<div class="intro">
			<h2 id="spec-title" class="title" {@attach splitLines()}>
				{spectralLines.length} raies, une seule trajectoire.
			</h2>
			<p class="lead" {@attach reveal({ delay: 0.1 })}>
				Mon parcours lu comme un spectre&nbsp;: le temps devient longueur d'onde, chaque expérience et chaque
				diplôme laisse une raie lumineuse à sa propre couleur.
			</p>
		</div>

		<div class="band-desktop" {@attach reveal({ delay: 0.15 })}>
			<Spectrum lines={spectralLines} {active} onselect={(id) => (active = id)} />
		</div>
		<div class="band-mobile" {@attach reveal({ delay: 0.15 })}>
			<Spectrum lines={spectralLines} {active} showLabels={false} compact />
		</div>

		<ol class="list">
			{#each spectralLines as line (line.id)}
				<li>
					<button
						class="row"
						class:on={active === line.id}
						style:--c={line.color}
						onpointerenter={() => (active = line.id)}
						onclick={() => (active = line.id)}
					>
						<span class="nm label">{line.nm} nm</span>
						<span class="what">
							<span class="t">{line.title}</span>
							<span class="s">{line.subtitle}</span>
						</span>
						<span class="when label text-dust">{line.period}</span>
					</button>
				</li>
			{/each}
		</ol>

		<a href="/cv" class="more" data-cursor="Lire">
			Lire le spectre complet <Icon name="arrow-right" size={18} />
		</a>
	</div>
</section>

<style>
	.teaser {
		padding-block: clamp(5rem, 12vw, 10rem);
		border-top: 1px solid var(--line);
	}
	.sec-head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		margin-bottom: clamp(2rem, 5vw, 4rem);
		border-bottom: 1px solid var(--line);
	}
	.intro {
		display: grid;
		gap: 1.5rem;
		align-items: end;
		margin-bottom: clamp(3rem, 6vw, 5rem);
	}
	.title {
		font-size: clamp(2.4rem, 6.4vw, 6.2rem);
		font-weight: 700;
		font-stretch: 112%;
		letter-spacing: -0.035em;
		line-height: 0.95;
	}
	.lead {
		max-width: 30rem;
		color: var(--color-dust);
		line-height: 1.6;
	}
	.band-mobile {
		display: none;
	}
	.list {
		margin-top: 3rem;
		border-top: 1px solid var(--line);
	}
	.row {
		width: 100%;
		display: grid;
		grid-template-columns: 5.5rem 1fr auto;
		gap: 1rem;
		align-items: center;
		padding: 1.1rem 0;
		border-bottom: 1px solid var(--line);
		text-align: left;
		position: relative;
		transition: padding 0.6s var(--ease-expo);
	}
	.row::before {
		content: "";
		position: absolute;
		left: 0;
		top: 50%;
		width: 3px;
		height: 0;
		background: var(--c);
		box-shadow: 0 0 14px var(--c);
		transform: translateY(-50%);
		transition: height 0.5s var(--ease-expo);
	}
	.row.on {
		padding-left: 1.2rem;
	}
	.row.on::before {
		height: 70%;
	}
	.nm {
		color: var(--c);
	}
	.what {
		display: grid;
		gap: 0.15rem;
	}
	.t {
		font-size: clamp(1rem, 1.6vw, 1.25rem);
		font-weight: 600;
	}
	.s {
		color: var(--color-dust);
		font-size: 0.9rem;
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 2.5rem;
		font-size: clamp(1.2rem, 2.2vw, 1.7rem);
		font-weight: 650;
		font-stretch: 110%;
		transition:
			gap 0.5s var(--ease-expo),
			color 0.3s;
	}
	.more:hover {
		gap: 1.25rem;
		color: var(--color-web);
	}
	@media (min-width: 900px) {
		.intro {
			grid-template-columns: 1.4fr 1fr;
		}
	}
	@media (max-width: 767px) {
		.band-desktop {
			display: none;
		}
		.band-mobile {
			display: block;
		}
		.row {
			grid-template-columns: 4.5rem 1fr;
		}
		.when {
			grid-column: 2;
		}
	}
</style>
