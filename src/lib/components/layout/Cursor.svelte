<script lang="ts">
	import { onMount } from "svelte";
	import { gsap } from "#lib/motion/gsap.ts";

	let ring: HTMLDivElement;
	let dot: HTMLDivElement;
	let label = $state("");
	let color = $state("");
	let active = $state(false);
	let pressed = $state(false);
	let enabled = $state(false);

	onMount(() => {
		if (!matchMedia("(pointer: fine)").matches) return;
		enabled = true;
		document.documentElement.classList.add("has-cursor");

		const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
		const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
		const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
		const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });
		let visible = false;

		const move = (e: PointerEvent) => {
			if (!visible) {
				visible = true;
				gsap.set([ring, dot], { x: e.clientX, y: e.clientY });
				gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
			}
			rx(e.clientX);
			ry(e.clientY);
			dx(e.clientX);
			dy(e.clientY);
		};
		const over = (e: PointerEvent) => {
			const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button");
			active = !!target;
			label = target?.dataset.cursor ?? "";
			color = target?.dataset.cursorColor ?? "";
		};
		const leave = () => {
			visible = false;
			gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
		};
		const down = () => (pressed = true);
		const up = () => (pressed = false);

		window.addEventListener("pointermove", move);
		document.addEventListener("pointerover", over);
		document.documentElement.addEventListener("pointerleave", leave);
		window.addEventListener("pointerdown", down);
		window.addEventListener("pointerup", up);
		return () => {
			document.documentElement.classList.remove("has-cursor");
			window.removeEventListener("pointermove", move);
			document.removeEventListener("pointerover", over);
			document.documentElement.removeEventListener("pointerleave", leave);
			window.removeEventListener("pointerdown", down);
			window.removeEventListener("pointerup", up);
		};
	});
</script>

<div class="cursor" class:enabled aria-hidden="true">
	<div
		bind:this={ring}
		class="ring"
		class:active
		class:labelled={!!label}
		class:pressed
		style:--c={color || null}
	>
		<span class="cross h"></span>
		<span class="cross v"></span>
		{#if label}
			<span class="text">{label}</span>
		{/if}
	</div>
	<div bind:this={dot} class="dot"></div>
</div>

<style>
	.cursor {
		display: none;
	}
	.cursor.enabled {
		display: block;
	}
	.ring,
	.dot {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		pointer-events: none;
		opacity: 0;
	}
	.dot {
		width: 4px;
		height: 4px;
		margin: -2px 0 0 -2px;
		border-radius: 50%;
		background: var(--color-bone);
		mix-blend-mode: difference;
	}
	.ring {
		--c: var(--color-bone);
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		margin: -17px 0 0 -17px;
		border: 1px solid color-mix(in oklab, var(--c) 55%, transparent);
		border-radius: 50%;
		transition:
			width 0.45s var(--ease-expo),
			height 0.45s var(--ease-expo),
			margin 0.45s var(--ease-expo),
			border-radius 0.45s var(--ease-expo),
			background-color 0.45s var(--ease-expo),
			border-color 0.3s;
	}
	.cross {
		position: absolute;
		background: color-mix(in oklab, var(--c) 70%, transparent);
		transition: opacity 0.3s;
	}
	.cross.h {
		width: 9px;
		height: 1px;
		left: -12px;
		box-shadow: 46px 0 0 color-mix(in oklab, var(--c) 70%, transparent);
	}
	.cross.v {
		width: 1px;
		height: 9px;
		top: -12px;
		box-shadow: 0 46px 0 color-mix(in oklab, var(--c) 70%, transparent);
	}
	.ring.active {
		width: 54px;
		height: 54px;
		margin: -27px 0 0 -27px;
		border-color: var(--c);
	}
	.ring.labelled {
		width: 92px;
		height: 92px;
		margin: -46px 0 0 -46px;
		background: color-mix(in oklab, var(--c) 92%, transparent);
		border-color: transparent;
	}
	.ring.labelled .cross {
		opacity: 0;
	}
	.ring.pressed {
		scale: 0.85;
	}
	.text {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-ink);
		font-weight: 600;
		text-align: center;
		line-height: 1.2;
		padding: 0 8px;
	}
</style>
