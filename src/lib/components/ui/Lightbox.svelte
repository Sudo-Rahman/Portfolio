<script lang="ts" module>
	export interface LightboxItem {
		src: string;
		alt: string;
		caption: string;
		/** The thumbnail the picture grows from, and shrinks back to. */
		el: HTMLImageElement;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { gsap } from "#lib/motion/gsap.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import Icon from "#lib/components/ui/Icon.svelte";

	let items = $state<LightboxItem[]>([]);
	let current = $state(0);
	let shown = $state(false);

	let backdrop = $state<HTMLDivElement>();
	let img = $state<HTMLImageElement>();
	let chrome = $state<HTMLDivElement>();
	let closeBtn = $state<HTMLButtonElement>();
	let busy = false;

	const OPEN_RADIUS = 14;

	const item = $derived(items[current]);

	/** Largest box with the picture's ratio that fits ~80 % of the viewport, between the top and bottom bars. */
	function fit(el: HTMLImageElement) {
		const nw = el.naturalWidth || el.width;
		const nh = el.naturalHeight || el.height;
		const top = 64;
		const bottom = innerWidth < 700 ? 120 : 104;
		const maxW = innerWidth < 700 ? innerWidth - 24 : innerWidth * 0.9;
		const maxH = Math.min(innerHeight * 0.8, innerHeight - top - bottom);
		const k = Math.min(maxW / nw, maxH / nh);
		const width = nw * k;
		const height = nh * k;
		return {
			width,
			height,
			left: (innerWidth - width) / 2,
			top: top + (innerHeight - top - bottom - height) / 2,
		};
	}

	/** Lazy thumbnails may not have a size yet: load them before measuring. */
	async function loaded(el: HTMLImageElement) {
		if (el.naturalWidth) return;
		el.loading = "eager";
		await el.decode().catch(() => {});
	}

	const rectOf = (el: HTMLElement) => {
		const r = el.getBoundingClientRect();
		return { left: r.left, top: r.top, width: r.width, height: r.height };
	};

	export async function open(list: LightboxItem[], index: number) {
		if (shown || busy) return;
		await loaded(list[index].el);
		items = list;
		current = index;
		busy = true;
		shown = true;
		getLenis()?.stop();
		await tick();
		if (!img || !backdrop || !chrome) return;

		const from = items[current].el;
		const radius = parseFloat(getComputedStyle(from).borderTopLeftRadius) || 16;
		gsap.set(img, { ...rectOf(from), borderRadius: radius, opacity: 1, x: 0 });
		from.style.visibility = "hidden";
		gsap.to(backdrop, { opacity: 1, duration: 0.6, ease: "power2.out" });
		gsap.fromTo(chrome.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.05, delay: 0.3 });
		gsap.to(img, {
			...fit(from),
			borderRadius: OPEN_RADIUS,
			duration: 1,
			ease: "expo.inOut",
			onComplete: () => (busy = false),
		});
		closeBtn?.focus({ preventScroll: true });
	}

	export function close() {
		if (!shown || busy || !img || !backdrop || !chrome) return;
		busy = true;
		const from = items[current].el;
		// The thumbnail may have been scrolled away while browsing: bring it back before shrinking onto it.
		getLenis()?.scrollTo(from, { immediate: true, force: true, offset: -(innerHeight - from.getBoundingClientRect().height) / 2 });
		const radius = parseFloat(getComputedStyle(from).borderTopLeftRadius) || 16;
		gsap.to(chrome.children, { opacity: 0, duration: 0.3, ease: "power2.in" });
		gsap.to(backdrop, { opacity: 0, duration: 0.8, ease: "power2.inOut" });
		gsap.to(img, {
			...rectOf(from),
			borderRadius: radius,
			duration: 0.9,
			ease: "expo.inOut",
			onComplete: () => {
				for (const it of items) it.el.style.visibility = "";
				shown = false;
				busy = false;
				getLenis()?.start();
			},
		});
	}

	function go(step: number) {
		if (!shown || busy || items.length < 2 || !img) return;
		busy = true;
		const next = (current + step + items.length) % items.length;
		const dir = step > 0 ? 1 : -1;
		const ready = loaded(items[next].el);
		gsap.to(img, {
			opacity: 0,
			x: -60 * dir,
			duration: 0.3,
			ease: "power2.in",
			onComplete: async () => {
				items[current].el.style.visibility = "";
				await ready;
				current = next;
				items[current].el.style.visibility = "hidden";
				await tick();
				if (!img) return;
				gsap.set(img, { ...fit(items[current].el), borderRadius: OPEN_RADIUS, x: 60 * dir });
				gsap.to(img, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out", onComplete: () => (busy = false) });
			},
		});
		gsap.fromTo(".lb-caption", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "expo.out" });
	}

	function onKey(e: KeyboardEvent) {
		if (!shown) return;
		if (e.key === "Escape") close();
		else if (e.key === "ArrowRight") go(1);
		else if (e.key === "ArrowLeft") go(-1);
	}

	function onResize() {
		if (shown && !busy && img) gsap.set(img, fit(items[current].el));
	}

	let touchX = 0;
</script>

<svelte:window onkeydown={onKey} onresize={onResize} />

{#if shown && item}
	<div
		class="lb"
		role="dialog"
		aria-modal="true"
		aria-label="Image en plein écran"
		tabindex="-1"
		ontouchstart={(e) => (touchX = e.touches[0].clientX)}
		ontouchend={(e) => {
			const dx = e.changedTouches[0].clientX - touchX;
			if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
		}}
	>
		<div class="backdrop" bind:this={backdrop} onclick={close} role="presentation"></div>
		<img bind:this={img} src={item.src} alt={item.alt} draggable="false" />
		<div class="chrome" bind:this={chrome}>
			<span class="count label">{String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
			<button class="x" bind:this={closeBtn} onclick={close} aria-label="Fermer" data-cursor="Fermer">
				<Icon name="close" size={20} />
			</button>
			<div class="bar">
				{#if items.length > 1}
					<button class="nav" onclick={() => go(-1)} aria-label="Image précédente"><Icon name="arrow-left" size={20} /></button>
				{/if}
				<p class="lb-caption label">{item.caption || item.alt}</p>
				{#if items.length > 1}
					<button class="nav" onclick={() => go(1)} aria-label="Image suivante"><Icon name="arrow-right" size={20} /></button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.lb {
		position: fixed;
		inset: 0;
		z-index: 80;
		touch-action: pan-y;
	}
	.backdrop {
		position: absolute;
		inset: 0;
		opacity: 0;
		background: color-mix(in oklab, var(--color-ink) 88%, transparent);
		backdrop-filter: blur(18px) saturate(1.2);
	}
	img {
		position: fixed;
		max-width: none;
		object-fit: cover;
		user-select: none;
		border: 1px solid var(--line-strong);
		box-shadow: 0 3rem 8rem -2rem rgb(0 0 0 / 0.7);
	}
	.chrome {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.chrome > * {
		pointer-events: auto;
	}
	.count {
		position: absolute;
		top: 1.4rem;
		left: var(--gutter);
		color: var(--color-dust);
	}
	.x {
		position: absolute;
		top: 0.9rem;
		right: var(--gutter);
		display: grid;
		place-items: center;
		width: 2.8rem;
		height: 2.8rem;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		background: var(--color-graphite);
		transition:
			background-color 0.3s,
			color 0.3s,
			transform 0.6s var(--ease-expo);
	}
	.x:hover {
		background: var(--color-bone);
		color: var(--color-ink);
		transform: rotate(90deg);
	}
	.bar {
		position: absolute;
		inset: auto var(--gutter) 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.2rem;
		pointer-events: none;
	}
	.bar > * {
		pointer-events: auto;
	}
	.lb-caption {
		max-width: min(46rem, 100%);
		flex: 0 1 auto;
		text-align: center;
		color: var(--color-bone);
		line-height: 1.5;
	}
	.nav {
		display: grid;
		flex: none;
		place-items: center;
		width: 2.8rem;
		height: 2.8rem;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		background: var(--color-graphite);
		transition:
			background-color 0.3s,
			color 0.3s;
	}
	.nav:hover {
		background: var(--color-bone);
		color: var(--color-ink);
	}
</style>
