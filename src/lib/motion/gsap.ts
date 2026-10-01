import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
	CustomEase.create("reaction", "0.7, 0, 0.1, 1");
}

/** Characters used when text "decrypts" itself. */
export const ELEMENT_CHARS = "HeLiBeNaMgAlSiClArCaTiCrFeCoNiCuZnGaKrRbSrAgCdSnXeCsBaPtAuHgPbRnFrRa0123456789";

export { gsap, ScrollTrigger, SplitText };
