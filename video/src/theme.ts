import { Easing, interpolate } from "remotion";

export const FPS = 30;

export const C = {
	ink: "#09090b",
	graphite: "#111114",
	slate: "#19191e",
	bone: "#eceae4",
	dust: "#8d8b94",
	line: "rgba(236,234,228,0.14)",
	mobile: "#ff4d6a",
	desktop: "#ffb224",
	web: "#3ddc97",
	data: "#b892ff",
	system: "#4d8dff",
};

export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const quartInOut = Easing.bezier(0.76, 0, 0.24, 1);

/** 0 → 1 progress over `duration` frames starting at `delay`, expo-out eased. */
export const ease = (frame: number, delay = 0, duration = 30, easing = expoOut) =>
	interpolate(frame, [delay, delay + duration], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing,
	});

export const sec = (s: number) => Math.round(s * FPS);
