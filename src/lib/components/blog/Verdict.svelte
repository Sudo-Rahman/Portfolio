<script lang="ts">
	import { onMount } from "svelte";
	import { gsap, ScrollTrigger } from "#lib/motion/gsap.ts";
	import { reveal } from "#lib/motion/attachments.ts";
	import type { Post } from "#lib/data/posts.ts";

	let { post }: { post: Post } = $props();

	const R = 90;
	const C = 2 * Math.PI * R;

	let ring: SVGCircleElement;
	let numEl: HTMLElement;
	let root: HTMLElement;

	onMount(() => {
		const { value, max } = post.rating ?? { value: 0, max: 10 };
		const state = { v: 0 };
		const fmt = (v: number) => v.toFixed(1).replace(".", ",");
		numEl.textContent = fmt(0);
		const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 75%", once: true } });
		tl.fromTo(ring, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - value / max), duration: 2.2, ease: "expo.out" }, 0);
		tl.to(state, { v: value, duration: 2.2, ease: "expo.out", onUpdate: () => (numEl.textContent = fmt(state.v)) }, 0);
		return () => {
			tl.scrollTrigger?.kill();
			tl.kill();
			numEl.textContent = fmt(value);
		};
	});
</script>

<section class="verdict" bind:this={root} aria-labelledby="verdict">
	<div class="score" {@attach reveal({ y: 30 })}>
		<svg viewBox="0 0 220 220" aria-hidden="true">
			<circle cx="110" cy="110" r={R} class="back" />
			<circle cx="110" cy="110" r={R} class="arc" stroke-dasharray={C} stroke-dashoffset={C} bind:this={ring} />
		</svg>
		<div class="num">
			<span bind:this={numEl} class="v">{post.rating?.value.toFixed(1).replace(".", ",")}</span>
			<span class="label max">/ {post.rating?.max}</span>
		</div>
	</div>

	<div class="cols">
		<div {@attach reveal({ delay: 0.1 })}>
			<p class="label head" style:color="var(--color-web)">Points forts</p>
			<ul class="pro">
				{#each post.pros as p (p)}<li>{p}</li>{/each}
			</ul>
		</div>
		<div {@attach reveal({ delay: 0.2 })}>
			<p class="label head" style:color="var(--color-mobile)">Point faible</p>
			<ul class="con">
				{#each post.cons as p (p)}<li>{p}</li>{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.verdict {
		display: grid;
		gap: 3rem;
		align-items: center;
		padding: clamp(1.5rem, 4vw, 3rem);
		border: 1px solid var(--line-strong);
		border-radius: 1.4rem;
		background:
			radial-gradient(90% 120% at 0% 0%, color-mix(in oklab, var(--c) 18%, transparent), transparent 60%),
			var(--color-graphite);
	}
	.score {
		position: relative;
		width: clamp(11rem, 24vw, 15rem);
		justify-self: center;
	}
	svg {
		display: block;
		transform: rotate(-90deg);
	}
	circle {
		fill: none;
		stroke-width: 10;
	}
	.back {
		stroke: var(--line);
	}
	.arc {
		stroke: var(--c);
		stroke-linecap: round;
		filter: drop-shadow(0 0 10px var(--c));
	}
	.num {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.2rem;
	}
	.v {
		font-size: clamp(3.4rem, 8vw, 4.8rem);
		font-weight: 800;
		font-stretch: 118%;
		letter-spacing: -0.05em;
		line-height: 0.9;
	}
	.max {
		color: var(--color-dust);
	}
	.cols {
		display: grid;
		gap: 2rem;
	}
	.head {
		margin-bottom: 1rem;
	}
	ul {
		display: grid;
		gap: 0.7rem;
	}
	li {
		position: relative;
		padding-left: 1.5rem;
		line-height: 1.45;
		font-weight: 520;
	}
	li::before {
		position: absolute;
		left: 0;
		font-family: var(--font-mono);
	}
	.pro li::before {
		content: "+";
		color: var(--color-web);
	}
	.con li::before {
		content: "−";
		color: var(--color-mobile);
	}
	@media (min-width: 900px) {
		.verdict {
			grid-template-columns: auto 1fr;
			gap: 4rem;
		}
		.cols {
			grid-template-columns: 1.4fr 1fr;
		}
	}
</style>
