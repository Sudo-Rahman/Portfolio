<script lang="ts">
	import { onMount } from "svelte";
	import { elements } from "#lib/data/projects.ts";
	import { familyById } from "#lib/data/elements.ts";
	import { spectrumGradient } from "#lib/data/spectrum.ts";
	import { gsap } from "#lib/motion/gsap.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import { ui } from "#lib/state.svelte.ts";

	const STRIPS = 7;
	let count = $state(0);
	let gone = $state(false);

	onMount(() => {
		getLenis()?.stop();
		window.scrollTo(0, 0);
		const state = { n: 0 };
		const tl = gsap.timeline({ delay: 0.2 });
		tl.to(state, {
			n: elements.length,
			duration: 1.9,
			ease: "power2.inOut",
			onUpdate: () => (count = Math.round(state.n)),
		})
			.to(".pl-bar", { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
			.to(".pl-content", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" }, "+=0.15")
			.to(
				".pl-strip",
				{ yPercent: -100, duration: 1.1, ease: "expo.inOut", stagger: { each: 0.06, from: "center" } },
				"-=0.15",
			)
			.call(
				() => {
					ui.introDone = true;
					getLenis()?.start();
				},
				[],
				"-=0.8",
			)
			.call(() => (gone = true));
		return () => tl.kill();
	});
</script>

{#if !gone}
	<div class="preloader" aria-hidden="true">
		<div class="strips" style:--strips={STRIPS}>
			{#each { length: STRIPS } as _, i (i)}
				<div class="pl-strip"></div>
			{/each}
		</div>

		<div class="pl-content wrap">
			<p class="label text-dust">Synthèse des éléments</p>
			<div class="counter display">
				<span>{String(count).padStart(2, "0")}</span>
				<small>/{elements.length}</small>
			</div>
			<ol class="row">
				{#each elements as el, i (el.slug)}
					<li class:on={i < count} style:--c={familyById[el.family].color}>{el.symbol}</li>
				{/each}
			</ol>
			<div class="track">
				<div class="pl-bar" style:background={spectrumGradient}></div>
			</div>
		</div>
	</div>
{/if}

<style>
	.preloader {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		pointer-events: none;
	}
	.strips {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--strips), 1fr);
	}
	.pl-strip {
		background: var(--color-ink);
		margin-inline: -1px;
	}
	.pl-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}
	.counter {
		display: flex;
		align-items: flex-start;
		font-size: clamp(6rem, 24vw, 16rem);
		font-variant-numeric: tabular-nums;
	}
	.counter small {
		margin-top: 0.6em;
		font-size: 0.16em;
		font-family: var(--font-mono);
		font-weight: 400;
		letter-spacing: 0;
		color: var(--color-dust);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
		max-width: 36rem;
	}
	.row li {
		width: 1.9rem;
		height: 1.9rem;
		display: grid;
		place-items: center;
		font-size: 0.7rem;
		font-weight: 700;
		border: 1px solid var(--line);
		border-radius: 0.3rem;
		color: var(--color-ash);
		transition:
			color 0.3s,
			border-color 0.3s,
			box-shadow 0.3s;
	}
	.row li.on {
		color: var(--c);
		border-color: color-mix(in oklab, var(--c) 60%, transparent);
		box-shadow: 0 0 14px -4px var(--c);
	}
	.track {
		width: min(28rem, 80vw);
		height: 2px;
		background: var(--line);
		overflow: hidden;
	}
	.pl-bar {
		height: 100%;
		transform: scaleX(0);
		transform-origin: left;
	}
</style>
