export type Scene =
	| { type: "title"; seconds: number; symbol: string; number: string; title: string; subtitle: string; tags: string[] }
	| { type: "clip"; src: string; from: number; to: number; rate: number; label: string; caption: string }
	| {
			type: "photos";
			seconds: number;
			label: string;
			caption: string;
			frame?: "photo" | "browser";
			items: { src: string; fit?: "cover" | "contain"; pos?: string }[];
	  }
	| {
			type: "bench";
			seconds: number;
			label: string;
			caption: string;
			tools: { name: string; photo: string; down: number; up: number; ping: number }[];
			footnote: string;
	  }
	| { type: "score"; seconds: number; score: number; max: number; verdict: string; pros: string[]; cons: string[] }
	| { type: "outro"; seconds: number; line: string; url: string };

export interface ReviewConfig {
	/** Short tag shown in the HUD, e.g. "Test 01". */
	tag: string;
	symbol: string;
	title: string;
	accent: string;
	scenes: Scene[];
}
