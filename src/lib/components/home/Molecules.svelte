<script lang="ts">
	import { onMount } from "svelte";
	import { molecule } from "#lib/data/molecules.ts";
	import { familyById } from "#lib/data/elements.ts";
	import { projectHref } from "#lib/data/projects.ts";
	import { MoleculeScene } from "#lib/gl/MoleculeScene.ts";
	import { reveal, splitLines } from "#lib/motion/attachments.ts";

	const { atoms, bonds } = molecule;
	// Fewer permanent labels on narrow screens so they never pile up.
	let minCount = $state(2);

	let canvas: HTMLCanvasElement;
	let box: HTMLDivElement;
	let labels: HTMLSpanElement[] = $state([]);
	let hovered = $state(-1);

	const focus = $derived(hovered >= 0 ? atoms[hovered] : atoms[0]);

	onMount(() => {
		const scene = new MoleculeScene(
			canvas,
			atoms,
			bonds,
			(projected) => {
				projected.forEach((p, i) => {
					const el = labels[i];
					if (!el) return;
					const show = atoms[i].projects.length >= minCount || i === hovered;
					el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
					el.style.opacity = show ? String(0.35 + (p.depth + 1) * 0.32) : "0";
				});
			},
			(index) => (hovered = index),
		);

		const resize = () => {
			minCount = box.clientWidth < 600 ? 3 : 2;
			scene.resize(box.clientWidth, box.clientHeight);
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(box);

		const io = new IntersectionObserver(([e]) => scene.setRunning(e.isIntersecting));
		io.observe(box);

		const local = (e: PointerEvent) => {
			const r = box.getBoundingClientRect();
			return [e.clientX - r.left, e.clientY - r.top] as const;
		};
		const down = (e: PointerEvent) => scene.pointerDown(...local(e));
		const move = (e: PointerEvent) => scene.pointerMove(...local(e));
		const up = () => scene.pointerUp();
		const leave = () => scene.pointerLeave();
		box.addEventListener("pointerdown", down);
		box.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		box.addEventListener("pointerleave", leave);

		return () => {
			box.removeEventListener("pointerdown", down);
			box.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			box.removeEventListener("pointerleave", leave);
			ro.disconnect();
			io.disconnect();
			scene.dispose();
		};
	});
</script>

<section class="molecules" aria-labelledby="mol-title">
	<div class="wrap">
		<header class="sec-head">
			<p class="label text-dust">03 — Liaisons</p>
			<p class="label text-dust">{atoms.length} atomes · {bonds.length} liaisons</p>
		</header>
		<div class="intro">
			<h2 id="mol-title" class="title" {@attach splitLines()}>
				Chaque liaison est un projet.
			</h2>
			<p class="lead" {@attach reveal({ delay: 0.15 })}>
				Les technologies sont des atomes. Deux atomes se lient dès qu'un projet les a combinés&nbsp;: plus
				l'atome est gros, plus je l'ai utilisé. Faites tourner la molécule et survolez un atome.
			</p>
		</div>
	</div>

	<div class="viewport" bind:this={box} data-cursor="">
		<p class="drag label text-dust">Glisser pour tourner · toucher un atome pour lire</p>
		<canvas bind:this={canvas} aria-hidden="true"></canvas>
		<div class="labels" aria-hidden="true">
			{#each atoms as atom, i (atom.id)}
				<span
					class="atom-label"
					class:hot={i === hovered}
					style:--c={atom.color}
					bind:this={labels[i]}
				>
					{atom.label}
				</span>
			{/each}
		</div>
	</div>

	<div class="wrap">
		<div class="readout" style:--c={focus.color}>
			<div class="r-atom">
				<span class="label text-dust">{hovered >= 0 ? "Atome observé" : "Atome le plus lié"}</span>
				<span class="r-name">{focus.label}</span>
				<span class="label" style:color={focus.color}>
					{familyById[focus.family].label} · {focus.projects.length} projet{focus.projects.length > 1 ? "s" : ""}
				</span>
			</div>
			<ul class="r-projects">
				{#each focus.projects as p (p.slug)}
					<li>
						<a
							href={projectHref(p)}
							class="mini"
							style:--c={familyById[p.family].color}
							data-cursor={p.symbol}
							data-cursor-color={familyById[p.family].color}
						>
							<span class="m-sym">{p.symbol}</span>
							<span class="m-name">{p.title}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.molecules {
		padding-block: clamp(5rem, 12vw, 10rem);
		border-top: 1px solid var(--line);
		background: radial-gradient(60% 50% at 50% 55%, rgb(184 146 255 / 0.07), transparent 70%);
	}
	.sec-head {
		display: flex;
		justify-content: space-between;
		padding-bottom: 1rem;
		margin-bottom: clamp(2rem, 5vw, 4rem);
		border-bottom: 1px solid var(--line);
	}
	.intro {
		display: grid;
		gap: 1.5rem;
		align-items: end;
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
	.viewport {
		position: relative;
		height: clamp(28rem, 78svh, 54rem);
		touch-action: pan-y;
		user-select: none;
	}
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.drag {
		position: absolute;
		left: var(--gutter);
		bottom: 1rem;
		z-index: 1;
	}
	.labels {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.atom-label {
		position: absolute;
		top: 0;
		left: 0;
		margin: -0.6rem 0 0 1rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: var(--color-bone);
		text-transform: uppercase;
		white-space: nowrap;
		opacity: 0;
		will-change: transform;
		transition: color 0.3s;
	}
	.atom-label.hot {
		color: var(--c);
		font-size: 0.8rem;
		font-weight: 600;
	}
	.readout {
		display: grid;
		gap: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--line);
	}
	.r-atom {
		display: grid;
		gap: 0.4rem;
		align-content: start;
	}
	.r-name {
		font-size: clamp(2rem, 4vw, 3.2rem);
		font-weight: 750;
		font-stretch: 115%;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--c);
	}
	.r-projects {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-content: start;
	}
	.mini {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.9rem 0.4rem 0.4rem;
		border: 1px solid color-mix(in oklab, var(--c) 35%, transparent);
		border-radius: 0.6rem;
		background: var(--color-graphite);
		transition:
			border-color 0.3s,
			transform 0.5s var(--ease-expo);
	}
	.mini:hover {
		border-color: var(--c);
		transform: translateY(-3px);
	}
	.m-sym {
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 0.4rem;
		background: color-mix(in oklab, var(--c) 18%, transparent);
		color: var(--c);
		font-weight: 800;
	}
	.m-name {
		font-size: 0.9rem;
		font-weight: 500;
	}
	@media (min-width: 900px) {
		.intro {
			grid-template-columns: 1.4fr 1fr;
		}
		.readout {
			grid-template-columns: 1fr 2fr;
		}
	}
</style>
