<script lang="ts">
	import { onMount } from "svelte";
	import { gsap } from "#lib/motion/gsap.ts";

	let {
		technologies,
		color,
		symbol,
	}: { technologies: string[]; color: string; symbol: string } = $props();

	// Electrons fill shells like a Bohr model: 2, then 6, then the rest.
	const CAPACITY = [2, 6, 12];
	const shells = $derived.by(() => {
		const result: string[][] = [];
		let i = 0;
		for (const cap of CAPACITY) {
			if (i >= technologies.length) break;
			result.push(technologies.slice(i, i + cap));
			i += cap;
		}
		return result;
	});

	const TILT = [64, 72, 58];
	const SPIN = [0, 62, 128];

	let box: HTMLDivElement;
	let size = $state(400);
	let beta = $state(SPIN);
	let electrons: HTMLSpanElement[] = $state([]);

	const radius = (shell: number) => size * (0.2 + shell * 0.13);
	const height = $derived(size * 0.78);

	onMount(() => {
		const ro = new ResizeObserver(() => (size = box.clientWidth));
		ro.observe(box);

		let tiltX = 0;
		let tiltY = 0;
		const move = (e: PointerEvent) => {
			const r = box.getBoundingClientRect();
			tiltX = ((e.clientY - r.top) / r.height - 0.5) * 18;
			tiltY = ((e.clientX - r.left) / r.width - 0.5) * 18;
		};
		window.addEventListener("pointermove", move);

		const tick = (time: number) => {
			const cx = size / 2;
			const cy = height / 2;
			beta = SPIN.map((b, i) => b + time * (6 + i * 3) + tiltY);
			let k = 0;
			shells.forEach((shell, s) => {
				const r = radius(s);
				const a = ((TILT[s] + tiltX) * Math.PI) / 180;
				const b = (beta[s] * Math.PI) / 180;
				shell.forEach((_, e) => {
					const theta = time * (0.9 / (s + 1)) + (e / shell.length) * Math.PI * 2;
					const x = r * Math.cos(theta);
					const y = r * Math.sin(theta) * Math.cos(a);
					const z = r * Math.sin(theta) * Math.sin(a);
					const px = x * Math.cos(b) - y * Math.sin(b);
					const py = x * Math.sin(b) + y * Math.cos(b);
					const el = electrons[k++];
					if (!el) return;
					const depth = z / r;
					el.style.transform = `translate3d(${(cx + px).toFixed(1)}px, ${(cy + py).toFixed(1)}px, 0) scale(${(0.85 + depth * 0.2).toFixed(3)})`;
					el.style.zIndex = depth < 0 ? "1" : "3";
					el.style.opacity = (0.55 + (depth + 1) * 0.225).toFixed(2);
				});
			});
		};
		gsap.ticker.add(tick);
		return () => {
			gsap.ticker.remove(tick);
			window.removeEventListener("pointermove", move);
			ro.disconnect();
		};
	});
</script>

<div class="atom" bind:this={box} style:--c={color} aria-hidden="true">
	<svg viewBox={`0 0 ${size} ${height}`} class="orbits">
		{#each shells as _, s (s)}
			<ellipse
				cx={size / 2}
				cy={height / 2}
				rx={radius(s)}
				ry={radius(s) * Math.cos((TILT[s] * Math.PI) / 180)}
				transform={`rotate(${beta[s]} ${size / 2} ${height / 2})`}
			/>
		{/each}
	</svg>

	<div class="nucleus">
		<span>{symbol}</span>
	</div>

	{#each shells.flat() as tech, i (tech + i)}
		<span class="electron" bind:this={electrons[i]}>
			<i></i>
			<span class="name">{tech}</span>
		</span>
	{/each}
</div>

<style>
	.atom {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 0.78;
	}
	.orbits {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.orbits ellipse {
		fill: none;
		stroke: color-mix(in oklab, var(--c) 45%, transparent);
		stroke-width: 1;
		stroke-dasharray: 2 5;
	}
	.nucleus {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		z-index: 2;
		pointer-events: none;
	}
	.nucleus span {
		display: grid;
		place-items: center;
		width: 19%;
		aspect-ratio: 1;
		border-radius: 50%;
		font-size: clamp(1.4rem, 4vw, 2.6rem);
		font-weight: 850;
		font-stretch: 125%;
		color: var(--color-ink);
		background: radial-gradient(circle at 35% 30%, #fff, var(--c) 45%, color-mix(in oklab, var(--c) 40%, #000) 100%);
		box-shadow:
			0 0 40px color-mix(in oklab, var(--c) 70%, transparent),
			0 0 120px color-mix(in oklab, var(--c) 35%, transparent);
		animation: beat 2.8s ease-in-out infinite;
	}
	@keyframes beat {
		50% {
			transform: scale(1.06);
		}
	}
	.electron {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		will-change: transform;
	}
	.electron i {
		width: 10px;
		height: 10px;
		margin: -5px 0 0 -5px;
		border-radius: 50%;
		background: var(--color-bone);
		box-shadow:
			0 0 0 3px color-mix(in oklab, var(--c) 35%, transparent),
			0 0 18px var(--c);
	}
	.name {
		margin-top: -5px;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
		padding: 0.15rem 0.4rem;
		border-radius: 0.25rem;
		background: color-mix(in oklab, var(--color-ink) 70%, transparent);
	}
</style>
