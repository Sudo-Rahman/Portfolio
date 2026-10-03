import { C } from "../theme";
import type { ReviewConfig } from "./types";

export const zyxelNwa50be: ReviewConfig = {
	tag: "Test 01",
	symbol: "Nw",
	title: "Zyxel NWA50BE",
	accent: C.system,
	scenes: [
		{
			type: "title",
			seconds: 3.6,
			symbol: "Nw",
			number: "01",
			title: "Zyxel NWA50BE",
			subtitle: "Le Wi-Fi 7 à 77 €, déballé, posé et mesuré.",
			tags: ["Wi-Fi 7", "BE5100", "2,5 GbE", "PoE+"],
		},
		{ type: "clip", src: "clips/unboxing.mp4", from: 0, to: 4, rate: 1, label: "01 — Déballage", caption: "Une boîte verte, sobre." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 6, to: 12, rate: 1.5, label: "01 — Déballage", caption: "Quick start, bloc secteur, support." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 28, to: 34, rate: 2, label: "02 — Contenu", caption: "Alimentation 12 V, embouts EU et UK." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 46, to: 58, rate: 3, label: "02 — Contenu", caption: "Support mural, vis et chevilles fournis." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 60, to: 68, rate: 2, label: "03 — Le boîtier", caption: "150 × 150 × 35 mm, 412 g." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 76, to: 82, rate: 1.5, label: "03 — Le boîtier", caption: "Sobre : une barre lumineuse, c'est tout." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 84, to: 92, rate: 2, label: "04 — Fixation", caption: "Le boîtier se clipse sur son support." },
		{ type: "clip", src: "clips/unboxing.mp4", from: 94, to: 100, rate: 1.5, label: "04 — Fixation", caption: "Un seul port : UPLINK 2,5 GbE, PoE+." },
		{
			type: "photos",
			seconds: 4.6,
			label: "05 — Installation",
			caption: "Tirer le câble, sertir la prise.",
			items: [{ src: "photos/83.jpg" }, { src: "photos/86.jpg" }, { src: "photos/89.jpg" }],
		},
		{
			type: "photos",
			seconds: 4.6,
			label: "05 — Installation",
			caption: "Switch PoE dans le rack, borne au plafond.",
			items: [{ src: "photos/87.jpg" }, { src: "photos/85.jpg" }, { src: "photos/90.jpg" }],
		},
		{
			type: "photos",
			seconds: 4.4,
			label: "06 — Interface",
			caption: "L'interface web : Windows 2000 n'est pas loin.",
			frame: "browser",
			items: [
				{ src: "shots/3.webp", fit: "cover", pos: "50% 0%" },
				{ src: "shots/1.webp", fit: "cover", pos: "50% 0%" },
			],
		},
		{
			type: "bench",
			seconds: 6.4,
			label: "07 — Débits",
			caption: "Le gigabit du switch est saturé.",
			tools: [
				{ name: "Speedtest", photo: "photos/91.jpg", down: 917, up: 787, ping: 11 },
				{ name: "nPerf", photo: "photos/92.jpg", down: 953, up: 872, ping: 18 },
			],
			footnote: "Mb/s · iPhone 17 Pro, Wi-Fi 5 GHz, à 5 m",
		},
		{
			type: "score",
			seconds: 5.6,
			score: 8.5,
			max: 10,
			verdict: "Imbattable à ce prix.",
			pros: ["77 € : 20 à 30 € de moins que la concurrence", "Wi-Fi 7, port 2,5 GbE, PoE+", "Installation simple, support mural propre"],
			cons: ["Interface standalone d'un autre âge"],
		},
		{ type: "outro", seconds: 2.8, line: "Test complet et fiche technique", url: "sudo-rahman.fr/blog" },
	],
};
