<script lang="ts">
	import { gsap, ScrollTrigger } from "#lib/motion/gsap.ts";
	import Lightbox, { type LightboxItem } from "#lib/components/ui/Lightbox.svelte";

	/** Rendered article HTML (see renderReport) with its figures, galleries and tables. */
	let { html, onactive }: { html: string; onactive?: (id: string) => void } = $props();

	let box: Lightbox;

	/** Figures open full screen: click, or Enter/Space when focused. */
	function zoomable(prose: HTMLElement) {
		const figures = [...prose.querySelectorAll<HTMLElement>(".figure")];
		for (const f of figures) {
			f.tabIndex = 0;
			f.setAttribute("role", "button");
			f.setAttribute("aria-label", "Agrandir l'image");
			f.dataset.cursor = "Agrandir";
		}
		const open = (target: EventTarget | null) => {
			const fig = (target as HTMLElement | null)?.closest<HTMLElement>(".figure");
			if (!fig || !prose.contains(fig)) return;
			const items: LightboxItem[] = figures.flatMap((f) => {
				const el = f.querySelector("img");
				return el ? [{ src: el.currentSrc || el.src, alt: el.alt, caption: f.querySelector(".caption")?.textContent ?? "", el }] : [];
			});
			box.open(items, figures.indexOf(fig));
		};
		const onClick = (e: MouseEvent) => open(e.target);
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				open(e.target);
			}
		};
		prose.addEventListener("click", onClick);
		prose.addEventListener("keydown", onKey);
		return () => {
			prose.removeEventListener("click", onClick);
			prose.removeEventListener("keydown", onKey);
		};
	}

	/** Reveals figures and reports which h2 section is being read. */
	function effects(prose: HTMLElement) {
		let activeId = "";
		const set = (id: string) => {
			activeId = id;
			onactive?.(id);
		};
		set("");
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
					if (self.isActive) set(h.id);
					else if (activeId === h.id && self.direction < 0 && i === 0) set("");
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
</script>

<div class="prose" {@attach effects} {@attach zoomable}>
	{@html html}
</div>
<Lightbox bind:this={box} />

<style>
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
	.prose :global(.figure) {
		cursor: zoom-in;
		outline-offset: 4px;
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
	.prose :global(.figure.portrait img) {
		aspect-ratio: 3 / 4;
		object-fit: cover;
	}
	.prose :global(.figure.phone img) {
		aspect-ratio: 2 / 3;
		object-fit: cover;
		object-position: top;
	}
	.prose > :global(.figure.portrait) {
		max-width: 26rem;
	}
	.prose :global(.gallery) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		gap: 1rem;
		margin: 2.5rem 0;
		align-items: start;
	}
	.prose :global(.gallery .figure) {
		margin: 0;
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
</style>
