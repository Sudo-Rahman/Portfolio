import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap.ts";

let lenis: Lenis | undefined;

/** Smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function startSmoothScroll(): () => void {
	lenis = new Lenis({ lerp: 0.085, anchors: { offset: -40 }, autoRaf: false });
	lenis.on("scroll", ScrollTrigger.update);

	const tick = (time: number) => lenis?.raf(time * 1000);
	gsap.ticker.add(tick);
	gsap.ticker.lagSmoothing(0);

	return () => {
		gsap.ticker.remove(tick);
		lenis?.destroy();
		lenis = undefined;
	};
}

export function getLenis(): Lenis | undefined {
	return lenis;
}
