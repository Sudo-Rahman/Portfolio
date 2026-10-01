<script lang="ts">
	import { onMount } from "svelte";
	import { familyById } from "#lib/data/elements.ts";
	import { elements, publishedProjects } from "#lib/data/projects.ts";
	import { profile } from "#lib/data/cv.ts";
	import { ReactionScene, type TargetRect } from "#lib/gl/ReactionScene.ts";
	import { gsap, ScrollTrigger } from "#lib/motion/gsap.ts";
	import { scramble } from "#lib/motion/attachments.ts";
	import { ui } from "#lib/state.svelte.ts";
	import PeriodicTable from "#lib/components/table/PeriodicTable.svelte";
	import Icon from "#lib/components/ui/Icon.svelte";

	const words = ["Rahman", "Yilmaz"];

	let section: HTMLElement;
	let stage: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let copy: HTMLDivElement;
	let tableStage: HTMLDivElement;
	let tableEl = $state<HTMLElement>();
	let interactive = $state(false);
	let introTl: gsap.core.Timeline | undefined;

	const clamp = (v: number) => Math.min(1, Math.max(0, v));

	/** Tile boxes relative to the stage, ignoring the transforms GSAP applies. */
	function tileRects(): TargetRect[] {
		if (!tableEl) return [];
		return [...tableEl.querySelectorAll<HTMLElement>("[data-tile]")].map((tile) => {
			let x = 0;
			let y = 0;
			let node: HTMLElement | null = tile;
			while (node && node !== stage) {
				x += node.offsetLeft;
				y += node.offsetTop;
				node = node.offsetParent as HTMLElement | null;
			}
			const family = tile.dataset.family as keyof typeof familyById;
			return { x, y, w: tile.offsetWidth, h: tile.offsetHeight, color: familyById[family].color };
		});
	}

	onMount(() => {
		const scene = new ReactionScene(canvas);
		const letters = [...copy.querySelectorAll<HTMLElement>(".ch")];
		const tiles = tableEl ? [...tableEl.querySelectorAll<HTMLElement>("[data-tile]")] : [];
		const extras = tableStage.querySelectorAll<HTMLElement>(".fade, .block-head, .period, .panel-slot");

		const layout = () => {
			const r = stage.getBoundingClientRect();
			scene.resize(r.width, r.height);
			scene.setTargets(tileRects());
		};
		layout();
		const ro = new ResizeObserver(layout);
		ro.observe(stage);

		// Scroll choreography ---------------------------------------------------
		const copyOut = gsap
			.timeline({ paused: true })
			.to(letters, { yPercent: -110, stagger: 0.02, ease: "power2.in", duration: 0.6 }, 0)
			.to(copy.querySelectorAll(".out, .meta"), { opacity: 0, y: -30, duration: 0.5, stagger: 0.05 }, 0);

		gsap.set(tiles, { opacity: 0, scale: 0.4 });
		gsap.set(extras, { opacity: 0, y: 30 });
		const tilesIn = gsap
			.timeline({ paused: true })
			.to(tiles, {
				opacity: 1,
				scale: 1,
				ease: "back.out(2)",
				duration: 0.5,
				stagger: { each: 0.025, from: "random" },
			})
			.to(extras, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.2);

		let inView = true;
		let needsRender = true;
		const apply = (p: number) => {
			copyOut.progress(clamp(p / 0.16));
			const dissolve = clamp((p - 0.06) / 0.22);
			const alpha = clamp((p - 0.05) / 0.08) * (1 - clamp((p - 0.66) / 0.14));
			scene.setProgress({ dissolve, morph: clamp((p - 0.12) / 0.5), alpha });
			tilesIn.progress(clamp((p - 0.56) / 0.18));
			interactive = p > 0.7;
			needsRender = dissolve < 1 || alpha > 0;
			scene.setRunning(inView && needsRender);
		};

		const st = ScrollTrigger.create({
			trigger: section,
			start: "top top",
			end: "bottom bottom",
			onUpdate: (self) => apply(self.progress),
			onRefresh: (self) => apply(self.progress),
		});
		apply(0);

		const io = new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
			scene.setRunning(inView && needsRender);
		});
		io.observe(section);

		// Pointer -------------------------------------------------------------
		const move = (e: PointerEvent) => {
			const r = stage.getBoundingClientRect();
			scene.setPointer(e.clientX - r.left, e.clientY - r.top);
			pointerX = (e.clientX - r.left) / r.width;
			lastMove = performance.now();
		};
		const leave = () => scene.setPointer(null, null);
		stage.addEventListener("pointermove", move);
		stage.addEventListener("pointerleave", leave);

		// Variable-font name: letters swell and widen around the pointer ----------
		let pointerX = 0.5;
		let lastMove = -Infinity;
		const current = letters.map(() => ({ w: 640, s: 100 }));
		const breathe = (time: number) => {
			const idle = performance.now() - lastMove > 2500;
			const focus = idle ? 0.5 + Math.sin(time * 0.55) * 0.48 : pointerX;
			const width = stage.clientWidth;
			const centers = letters.map((el) => {
				const r = el.getBoundingClientRect();
				return (r.left + r.width / 2) / width;
			});
			letters.forEach((el, i) => {
				const d = (centers[i] - focus) / 0.16;
				const k = Math.exp(-d * d);
				const c = current[i];
				c.w += (420 + k * 480 - c.w) * 0.12;
				c.s += (88 + k * 37 - c.s) * 0.12;
				el.style.fontWeight = c.w.toFixed(0);
				el.style.fontStretch = `${c.s.toFixed(1)}%`;
			});
		};
		gsap.ticker.add(breathe);

		return () => {
			gsap.ticker.remove(breathe);
			stage.removeEventListener("pointermove", move);
			stage.removeEventListener("pointerleave", leave);
			st.kill();
			io.disconnect();
			ro.disconnect();
			copyOut.kill();
			tilesIn.kill();
			introTl?.kill();
			scene.dispose();
		};
	});

	// Entrance once the preloader has finished
	$effect(() => {
		if (!ui.introDone) return;
		introTl = gsap
			.timeline()
			.fromTo(canvas, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 2.2, ease: "expo.out" }, 0)
			.from(copy.querySelectorAll(".ch-in"), { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.045 }, 0.1)
			.from(copy.querySelectorAll(".intro"), { opacity: 0, y: 20, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.5);
	});
</script>

<section class="reaction" bind:this={section} aria-label="Introduction">
	<div class="stage" bind:this={stage}>
		<canvas bind:this={canvas} class="gl" aria-hidden="true"></canvas>

		<div class="copy wrap" bind:this={copy}>
			<div class="top">
				<p class="label out intro">
					<span class="text-dust">Élément 00 — </span>Ry<br />
					<span class="text-dust">{profile.location}</span>
				</p>
				<p class="label out intro fig text-dust">
					Fig. 01 — Iridium liquide<br />
					<span class="text-bone fine">Approchez le curseur</span><span class="text-bone coarse">Touchez le métal</span>
				</p>
			</div>

			<div class="bottom">
				<h1 class="name" aria-label="Rahman Yilmaz">
					{#each words as word (word)}
						<span class="word" aria-hidden="true">
							{#each word.split("") as letter, i (i)}
								<span class="mask"><span class="ch-in"><span class="ch">{letter}</span></span></span>
							{/each}
						</span>
					{/each}
				</h1>
				<div class="meta">
					<p class="role out intro" {@attach scramble({ delay: 2.6, duration: 1.6 })}>
						Développeur Full Stack / Android
					</p>
					<p class="tagline out intro">
						J'écris des applications Android et iOS, des logiciels desktop en Rust et des sites web.
						{publishedProjects.length} sont publiés.
					</p>
					<p class="label hint out intro">
						<Icon name="arrow-down" size={14} />
						Défilez pour déclencher la réaction
					</p>
				</div>
			</div>
		</div>

		<div class="table-stage wrap" class:interactive bind:this={tableStage}>
			<div class="t-head">
				<div class="fade">
					<p class="label text-dust">Tableau périodique des projets</p>
					<h2 class="t-title">{elements.length} éléments, 6 périodes.</h2>
				</div>
				<a href="/projects" class="t-link fade label" data-cursor="Explorer">
					Explorer le tableau <Icon name="arrow-right" size={14} />
				</a>
			</div>
			<PeriodicTable fitHeight bind:el={tableEl} />
		</div>
	</div>
</section>

<style>
	.reaction {
		position: relative;
		height: 380svh;
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
		background:
			radial-gradient(40% 45% at 58% 42%, rgb(77 141 255 / 0.1), transparent 70%),
			radial-gradient(35% 40% at 40% 60%, rgb(255 77 106 / 0.06), transparent 70%);
	}
	.gl {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
	.copy {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-top: calc(var(--nav-h) + 1.25rem);
		padding-bottom: clamp(1.25rem, 3vw, 2.25rem);
		pointer-events: none;
	}
	.top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.fig {
		text-align: right;
	}
	.coarse {
		display: none;
	}
	@media (pointer: coarse) {
		.fine {
			display: none;
		}
		.coarse {
			display: inline;
		}
	}
	.name {
		display: flex;
		flex-wrap: wrap;
		column-gap: 0.22em;
		font-size: clamp(4.2rem, 19.5vw, 13rem);
		line-height: 0.82;
		letter-spacing: -0.04em;
		mix-blend-mode: difference;
		color: var(--color-bone);
	}
	.word {
		display: inline-flex;
	}
	.mask {
		display: inline-block;
		overflow: clip;
		padding-bottom: 0.06em;
	}
	.ch-in,
	.ch {
		display: inline-block;
	}
	.ch {
		font-weight: 640;
		font-stretch: 100%;
	}
	.meta {
		display: grid;
		gap: 0.75rem;
		margin-top: clamp(1rem, 2.5vw, 1.75rem);
		padding-top: clamp(0.9rem, 2vw, 1.25rem);
		border-top: 1px solid var(--line);
	}
	.role {
		font-weight: 600;
		font-stretch: 110%;
		font-size: clamp(1rem, 1.7vw, 1.35rem);
	}
	.tagline {
		max-width: 26rem;
		color: var(--color-dust);
		font-size: 0.95rem;
		line-height: 1.45;
	}
	.hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-dust);
	}
	.hint :global(svg) {
		animation: nudge 1.8s var(--ease-expo) infinite;
	}
	@keyframes nudge {
		50% {
			transform: translateY(4px);
		}
	}

	.table-stage {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: clamp(1rem, 2.5vh, 2rem);
		padding-top: calc(var(--nav-h) + 0.5rem);
		padding-bottom: 1rem;
		pointer-events: none;
	}
	.table-stage.interactive {
		pointer-events: auto;
	}
	.t-head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
	}
	.t-title {
		margin-top: 0.4rem;
		font-size: clamp(1.6rem, 3.6vw, 3rem);
		font-weight: 700;
		font-stretch: 112%;
		letter-spacing: -0.03em;
		line-height: 1;
	}
	.t-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.8rem 1.1rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		white-space: nowrap;
		transition:
			background-color 0.3s,
			color 0.3s;
	}
	.t-link:hover {
		background: var(--color-bone);
		color: var(--color-ink);
	}

	@media (min-width: 900px) {
		.name {
			flex-wrap: nowrap;
			font-size: clamp(4rem, 12.2vw, 15rem);
		}
		.meta {
			grid-template-columns: 1.1fr 1.4fr auto;
			align-items: end;
		}
	}
	@media (max-width: 599px) {
		.t-link {
			padding: 0.65rem 0.8rem;
			font-size: 0.6rem;
		}
	}
</style>
