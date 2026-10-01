import { education, experiences, formatDateRange } from "./cv.ts";

/**
 * The career is read as an emission spectrum: time is mapped onto the visible
 * spectrum, from violet (2020) to red (today), and every experience or diploma
 * becomes a line at its own wavelength.
 */
const START = toMonths("2020-01");
const END = toMonths("2026-12");
const NM_MIN = 390;
const NM_MAX = 700;

export interface SpectralLine {
	id: string;
	kind: "experience" | "education";
	title: string;
	subtitle: string;
	/** Short name shown on the spectrum band. */
	short: string;
	location: string;
	period: string;
	/** Position on the band, 0..1 */
	from: number;
	to: number;
	nm: number;
	color: string;
	highlights: string[];
	products: string[];
}

function toMonths(date: string): number {
	if (date === "présent") {
		const now = new Date();
		return now.getFullYear() * 12 + now.getMonth();
	}
	const [year, month = "6"] = date.split("-");
	return Number(year) * 12 + Number(month) - 1;
}

export function position(date: string): number {
	return Math.min(1, Math.max(0, (toMonths(date) - START) / (END - START)));
}

export function wavelength(t: number): number {
	return Math.round(NM_MIN + t * (NM_MAX - NM_MIN));
}

/** Approximate RGB of a visible wavelength (Dan Bruton's algorithm). */
export function wavelengthColor(nm: number): string {
	let r = 0;
	let g = 0;
	let b = 0;
	if (nm < 440) [r, g, b] = [-(nm - 440) / 60, 0, 1];
	else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
	else if (nm < 510) [r, g, b] = [0, 1, -(nm - 510) / 20];
	else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
	else if (nm < 645) [r, g, b] = [1, -(nm - 645) / 65, 0];
	else [r, g, b] = [1, 0, 0];

	// Keep the extremes bright enough to read on a dark background.
	const lift = (v: number) => Math.round(255 * Math.min(1, 0.18 + v * 0.9));
	return `rgb(${lift(r)} ${lift(g)} ${lift(b)})`;
}

export const spectrumGradient = `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) =>
	wavelengthColor(NM_MIN + (i / 12) * (NM_MAX - NM_MIN)),
).join(", ")})`;

export const yearTicks = Array.from({ length: 7 }, (_, i) => 2020 + i).map((year) => ({
	year,
	at: position(`${year}-01`),
}));

function line(
	id: string,
	kind: SpectralLine["kind"],
	start: string,
	end: string,
	rest: Omit<SpectralLine, "id" | "kind" | "from" | "to" | "nm" | "color">,
): SpectralLine {
	const from = position(start);
	const to = position(end);
	const nm = wavelength(from);
	return { id, kind, from, to, nm, color: wavelengthColor(nm), ...rest };
}

export const spectralLines: SpectralLine[] = [
	...experiences.map((e) =>
		line(`xp-${e.company}`, "experience", e.startDate, e.endDate, {
			title: e.position,
			subtitle: e.company,
			short: e.company.replace("Solo Agilis ", ""),
			location: e.location,
			period: formatDateRange(e),
			highlights: e.highlights,
			products: e.products ?? [],
		}),
	),
	...education.map((e) =>
		line(`edu-${e.degree}`, "education", e.startDate ?? e.date!, e.endDate ?? e.date!, {
			title: `${e.degree} · ${e.area}`,
			subtitle: e.institution,
			short: e.degree,
			location: e.location,
			period: formatDateRange(e),
			highlights: e.highlights ?? [],
			products: [],
		}),
	),
].sort((a, b) => b.from - a.from);
