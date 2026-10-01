<script lang="ts">
	import { profile } from "#lib/data/cv.ts";
	import { projects } from "#lib/data/projects.ts";
	import { countUp, reveal, splitLines } from "#lib/motion/attachments.ts";

	// The headline already says it: drop the repeated opening of the second paragraph.
	const paragraphs = profile.summary.map((p) =>
		p.replace(/^Développeur de métier et bricoleur par tempérament, je/, "Je"),
	);

	const properties = [
		["Symbole", "Ry"],
		["Numéro atomique", "00"],
		["Origine", "Chalon-sur-Saône, FR"],
		["Formation", "Master Informatique · BDIA"],
		["Configuration", "Full Stack / Android"],
		["Langues", "Français · Turc · Anglais B2"],
	];

	const stats = [
		{ value: projects.length, label: "éléments synthétisés", note: "projets, de 2021 à aujourd'hui" },
		{ value: 7, label: "apps SmartCity", note: "maintenues pour des collectivités chez Sweepin" },
		{
			value: projects.filter((p) => p.state === "product").length,
			label: "produits publiés",
			note: "Ultra Explorer, renamer, Nymbra, linkKeep",
		},
		{ value: 24, label: "mois d'alternance", note: "Android puis Full Stack, 2023 → 2025" },
	];
</script>

<section class="compose wrap" aria-labelledby="compose-title">
	<header class="sec-head">
		<p class="label text-dust">02 — Composé</p>
		<p class="label text-dust">Fiche d'identité</p>
	</header>

	<div class="grid">
		<aside class="card" {@attach reveal()}>
			<div class="atom" aria-hidden="true">
				<span class="orbit o1"><i></i></span>
				<span class="orbit o2"><i></i></span>
				<span class="orbit o3"><i></i></span>
				<div class="nucleus">
					<span class="num">00</span>
					<span class="sym">Ry</span>
					<span class="nm">Rahman Yilmaz</span>
				</div>
			</div>
			<dl class="props">
				{#each properties as [k, v] (k)}
					<div class="prop">
						<dt class="label text-dust">{k}</dt>
						<dd>{v}</dd>
					</div>
				{/each}
			</dl>
		</aside>

		<div class="text">
			<h2 id="compose-title" class="statement" {@attach splitLines()}>
				Développeur de métier, <em>bricoleur</em> par tempérament.
			</h2>
			<div class="paras" {@attach reveal({ children: true, delay: 0.2 })}>
				{#each paragraphs as para (para)}
					<p>{para}</p>
				{/each}
			</div>
		</div>
	</div>

	<ul class="stats">
		{#each stats as stat, i (stat.label)}
			<li class="stat" {@attach reveal({ delay: i * 0.08 })}>
				<span class="value display" {@attach countUp({ pad: 2 })}>{stat.value}</span>
				<span class="s-label">{stat.label}</span>
				<span class="label text-dust">{stat.note}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.compose {
		padding-block: clamp(6rem, 14vw, 12rem);
	}
	.sec-head {
		display: flex;
		justify-content: space-between;
		padding-bottom: 1rem;
		margin-bottom: clamp(2.5rem, 6vw, 5rem);
		border-bottom: 1px solid var(--line);
	}
	.grid {
		display: grid;
		gap: clamp(3rem, 6vw, 6rem);
	}
	.card {
		display: grid;
		gap: 2.5rem;
		align-content: start;
	}
	.atom {
		position: relative;
		width: min(100%, 22rem);
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		perspective: 900px;
	}
	.orbit {
		position: absolute;
		inset: 4%;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		transform-style: preserve-3d;
	}
	.orbit i {
		position: absolute;
		top: -4px;
		left: 50%;
		width: 8px;
		height: 8px;
		margin-left: -4px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 14px var(--c);
	}
	.o1 {
		--c: var(--color-desktop);
		animation: spin1 9s linear infinite;
	}
	.o2 {
		--c: var(--color-system);
		inset: 10%;
		animation: spin2 13s linear infinite;
	}
	.o3 {
		--c: var(--color-mobile);
		inset: 16%;
		animation: spin3 7s linear infinite;
	}
	@keyframes spin1 {
		from {
			transform: rotateX(68deg) rotateZ(0deg);
		}
		to {
			transform: rotateX(68deg) rotateZ(360deg);
		}
	}
	@keyframes spin2 {
		from {
			transform: rotateY(64deg) rotateX(20deg) rotateZ(0deg);
		}
		to {
			transform: rotateY(64deg) rotateX(20deg) rotateZ(-360deg);
		}
	}
	@keyframes spin3 {
		from {
			transform: rotateX(-50deg) rotateY(30deg) rotateZ(0deg);
		}
		to {
			transform: rotateX(-50deg) rotateY(30deg) rotateZ(360deg);
		}
	}
	.nucleus {
		position: relative;
		display: grid;
		width: 44%;
		aspect-ratio: 1;
		padding: 0.7rem;
		border: 1px solid var(--color-desktop);
		border-radius: 0.9rem;
		background:
			radial-gradient(100% 100% at 50% 120%, rgb(255 178 36 / 0.35), transparent 65%),
			var(--color-graphite);
		box-shadow: 0 2rem 5rem -2rem rgb(255 178 36 / 0.6);
		animation: float 6s ease-in-out infinite;
	}
	@keyframes float {
		50% {
			transform: translateY(-8px) rotate(-2deg);
		}
	}
	.nucleus .num {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-desktop);
	}
	.nucleus .sym {
		align-self: center;
		font-size: clamp(2.6rem, 6vw, 3.6rem);
		font-weight: 850;
		font-stretch: 125%;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.nucleus .nm {
		font-size: 0.7rem;
		color: var(--color-dust);
	}
	.props {
		display: grid;
		border-top: 1px solid var(--line);
	}
	.prop {
		display: grid;
		grid-template-columns: 9rem 1fr;
		gap: 1rem;
		padding-block: 0.8rem;
		border-bottom: 1px solid var(--line);
		font-size: 0.95rem;
	}
	.statement {
		font-size: clamp(2.4rem, 6.2vw, 6rem);
		font-weight: 700;
		font-stretch: 108%;
		letter-spacing: -0.035em;
		line-height: 0.98;
	}
	.statement em {
		font-style: italic;
		font-weight: 300;
		font-stretch: 125%;
		color: var(--color-desktop);
	}
	.paras {
		display: grid;
		gap: 1.25rem;
		max-width: 38rem;
		margin-top: clamp(2rem, 4vw, 3.5rem);
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		line-height: 1.6;
		color: color-mix(in oklab, var(--color-bone) 72%, transparent);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		margin-top: clamp(4rem, 9vw, 8rem);
		border-top: 1px solid var(--line);
	}
	.stat {
		display: grid;
		gap: 0.5rem;
		align-content: start;
		padding: 1.5rem 1rem 1.5rem 0;
		border-bottom: 1px solid var(--line);
	}
	.value {
		font-size: clamp(3.5rem, 8vw, 7rem);
		font-variant-numeric: tabular-nums;
	}
	.s-label {
		font-weight: 600;
		font-size: 1.05rem;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: minmax(18rem, 4fr) 8fr;
		}
		.stats {
			grid-template-columns: repeat(4, 1fr);
		}
		.stat {
			border-bottom: 0;
			padding-right: 2rem;
		}
		.stat + .stat {
			border-left: 1px solid var(--line);
			padding-left: 1.5rem;
		}
	}
</style>
