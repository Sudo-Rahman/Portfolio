import type { Attachment } from "svelte/attachments";
import { ELEMENT_CHARS, gsap, SplitText } from "./gsap.ts";

const ENTER = "top 88%";

/** Fades and lifts an element (or its children) in when it enters the viewport. */
export function reveal(
	opts: { y?: number; delay?: number; stagger?: number; children?: boolean } = {},
): Attachment<HTMLElement> {
	return (node) => {
		const tween = gsap.from(opts.children ? node.children : node, {
			y: opts.y ?? 48,
			opacity: 0,
			duration: 1.3,
			ease: "expo.out",
			delay: opts.delay ?? 0,
			stagger: opts.stagger ?? 0.08,
			scrollTrigger: { trigger: node, start: ENTER, once: true },
		});
		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
		};
	};
}

/** Masked line-by-line reveal, re-split automatically on resize. */
export function splitLines(opts: { delay?: number; immediate?: boolean } = {}): Attachment<HTMLElement> {
	return (node) => {
		const split = SplitText.create(node, {
			type: "lines",
			mask: "lines",
			linesClass: "split-line",
			autoSplit: true,
			onSplit(self) {
				return gsap.from(self.lines, {
					yPercent: 115,
					rotate: 2,
					duration: 1.4,
					ease: "expo.out",
					stagger: 0.09,
					delay: opts.delay ?? 0,
					scrollTrigger: opts.immediate ? undefined : { trigger: node, start: ENTER, once: true },
				});
			},
		});
		return () => split.revert();
	};
}

/** Text decrypts from random element symbols, on enter and again on hover. */
export function scramble(
	opts: { delay?: number; duration?: number; hover?: boolean; onEnter?: boolean } = {},
): Attachment<HTMLElement> {
	return (node) => {
		const text = node.textContent ?? "";
		const play = (delay = 0) =>
			gsap.to(node, {
				duration: opts.duration ?? 1.1,
				delay,
				ease: "none",
				scrambleText: { text, chars: ELEMENT_CHARS, speed: 0.6, revealDelay: 0.15 },
			});

		const intro =
			opts.onEnter === false
				? undefined
				: gsap.to(node, {
						duration: opts.duration ?? 1.1,
						delay: opts.delay ?? 0,
						ease: "none",
						scrambleText: { text, chars: ELEMENT_CHARS, speed: 0.6, revealDelay: 0.25 },
						scrollTrigger: { trigger: node, start: ENTER, once: true },
					});

		const onHover = () => play();
		if (opts.hover) node.addEventListener("pointerenter", onHover);
		return () => {
			intro?.scrollTrigger?.kill();
			intro?.kill();
			node.removeEventListener("pointerenter", onHover);
		};
	};
}

/** The element is attracted by the pointer and springs back when released. */
export function magnetic(strength = 0.35): Attachment<HTMLElement> {
	return (node) => {
		const x = gsap.quickTo(node, "x", { duration: 0.6, ease: "power3.out" });
		const y = gsap.quickTo(node, "y", { duration: 0.6, ease: "power3.out" });
		const move = (e: PointerEvent) => {
			const r = node.getBoundingClientRect();
			x((e.clientX - (r.left + r.width / 2)) * strength);
			y((e.clientY - (r.top + r.height / 2)) * strength);
		};
		const leave = () => {
			gsap.to(node, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });
		};
		node.addEventListener("pointermove", move);
		node.addEventListener("pointerleave", leave);
		return () => {
			node.removeEventListener("pointermove", move);
			node.removeEventListener("pointerleave", leave);
		};
	};
}

/** Counts from zero up to the element's numeric content. */
export function countUp(opts: { delay?: number; pad?: number } = {}): Attachment<HTMLElement> {
	return (node) => {
		const target = Number(node.textContent ?? 0);
		const state = { v: 0 };
		const tween = gsap.to(state, {
			v: target,
			duration: 2,
			delay: opts.delay ?? 0,
			ease: "expo.out",
			onUpdate: () => {
				node.textContent = String(Math.round(state.v)).padStart(opts.pad ?? 0, "0");
			},
			scrollTrigger: { trigger: node, start: ENTER, once: true },
		});
		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
			node.textContent = String(target).padStart(opts.pad ?? 0, "0");
		};
	};
}

/** Tilts the element in 3D towards the pointer. */
export function tilt(max = 10): Attachment<HTMLElement> {
	return (node) => {
		const rx = gsap.quickTo(node, "rotationX", { duration: 0.5, ease: "power3.out" });
		const ry = gsap.quickTo(node, "rotationY", { duration: 0.5, ease: "power3.out" });
		gsap.set(node, { transformPerspective: 700 });
		const move = (e: PointerEvent) => {
			const r = node.getBoundingClientRect();
			ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
			rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
		};
		const leave = () => {
			rx(0);
			ry(0);
		};
		node.addEventListener("pointermove", move);
		node.addEventListener("pointerleave", leave);
		return () => {
			node.removeEventListener("pointermove", move);
			node.removeEventListener("pointerleave", leave);
		};
	};
}
