import type { Project } from "./projects.ts";

export type Family = "mobile" | "desktop" | "web" | "data" | "system";
export type ProjectState = "product" | "open-source" | "academic" | "confidential";

export interface FamilyInfo {
	id: Family;
	label: string;
	/** Element whose flame test gives the family its colour. */
	flame: string;
	flameSymbol: string;
	color: string;
	description: string;
}

/** Each family is coloured after a flame test: the colour a metal burns with. */
export const families: FamilyInfo[] = [
	{
		id: "mobile",
		label: "Mobile",
		flame: "Lithium",
		flameSymbol: "Li",
		color: "#ff4d6a",
		description: "iOS, Android, SwiftUI, Jetpack Compose",
	},
	{
		id: "data",
		label: "Data & IA",
		flame: "Potassium",
		flameSymbol: "K",
		color: "#b892ff",
		description: "Entrepôts de données, ETL, NoSQL, NLP",
	},
	{
		id: "web",
		label: "Web",
		flame: "Cuivre",
		flameSymbol: "Cu",
		color: "#3ddc97",
		description: "SvelteKit, PHP, Angular, Three.js",
	},
	{
		id: "desktop",
		label: "Desktop",
		flame: "Sodium",
		flameSymbol: "Na",
		color: "#ffb224",
		description: "Rust/Tauri, C++/Qt, Iced, Swing",
	},
	{
		id: "system",
		label: "Système",
		flame: "Indium",
		flameSymbol: "In",
		color: "#4d8dff",
		description: "Sockets, processus, bibliothèques",
	},
];

export const familyById = Object.fromEntries(families.map((f) => [f.id, f])) as Record<
	Family,
	FamilyInfo
>;

export const stateLabels: Record<ProjectState, string> = {
	product: "Produit publié",
	"open-source": "Open source",
	academic: "Académique",
	confidential: "Confidentiel",
};

export interface TableCell {
	project: Project;
	/** 1-based grid row (period) and column. */
	row: number;
	col: number;
}

export interface TableLayout {
	years: number[];
	columns: number;
	blocks: { family: FamilyInfo; start: number; span: number }[];
	cells: TableCell[];
}

/**
 * Lays projects out like a periodic table: one row (period) per year,
 * one block of columns per family, elements filled left to right in atomic order.
 */
export function tableLayout(projects: Project[]): TableLayout {
	const sorted = [...projects].sort((a, b) => a.number - b.number);
	const years = [...new Set(sorted.map((p) => p.year))].sort((a, b) => a - b);

	const width = (family: Family) =>
		Math.max(
			1,
			...years.map((y) => sorted.filter((p) => p.family === family && p.year === y).length),
		);

	const blocks: TableLayout["blocks"] = [];
	let start = 1;
	for (const family of families) {
		const span = width(family.id);
		blocks.push({ family, start, span });
		start += span;
	}

	const cells: TableCell[] = [];
	for (const block of blocks) {
		for (const [row, year] of years.entries()) {
			sorted
				.filter((p) => p.family === block.family.id && p.year === year)
				.forEach((project, i) => cells.push({ project, row: row + 1, col: block.start + i }));
		}
	}

	return { years, columns: start - 1, blocks, cells };
}
