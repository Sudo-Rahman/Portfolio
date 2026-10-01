import { familyById, type Family } from "./elements.ts";
import { projects, type Project } from "./projects.ts";

/** Technologies are atoms; two atoms are bonded when a project combines them. */
export interface Atom {
	id: string;
	label: string;
	projects: Project[];
	family: Family;
	color: string;
}

export interface Bond {
	a: number;
	b: number;
	weight: number;
}

const aliases: Record<string, string> = {
	"Tauri 2": "Tauri",
	"Svelte 5": "Svelte",
	SvelteKit: "Svelte",
	"C++23": "C++",
	"Qt 6": "Qt",
	"Sockets TCP": "Sockets",
	"Tailwind CSS": "Tailwind",
	"Jetpack Compose": "Compose",
	"Swift Testing": "Swift",
	"GitHub Actions": "CI",
	"Core Data": "CoreData",
};

const ignored = new Set(["Closed source", "App Store", "Concurrency", "Face ID", "Linux"]);

function normalise(tech: string): string | undefined {
	if (ignored.has(tech)) return undefined;
	return aliases[tech] ?? tech;
}

function build() {
	const byId = new Map<string, Project[]>();
	for (const project of projects) {
		const techs = new Set(project.technologies.map(normalise).filter(Boolean) as string[]);
		for (const tech of techs) byId.set(tech, [...(byId.get(tech) ?? []), project]);
	}

	const atoms: Atom[] = [...byId.entries()]
		.sort((a, b) => b[1].length - a[1].length)
		.map(([id, used]) => {
			const counts = new Map<Family, number>();
			for (const p of used) counts.set(p.family, (counts.get(p.family) ?? 0) + 1);
			const family = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
			return { id, label: id, projects: used, family, color: familyById[family].color };
		});

	const index = new Map(atoms.map((a, i) => [a.id, i]));
	const weights = new Map<string, Bond>();
	for (const project of projects) {
		const ids = [...new Set(project.technologies.map(normalise).filter(Boolean) as string[])]
			.map((t) => index.get(t)!)
			.sort((a, b) => a - b);
		for (let i = 0; i < ids.length; i++) {
			for (let j = i + 1; j < ids.length; j++) {
				const key = `${ids[i]}-${ids[j]}`;
				const bond = weights.get(key) ?? { a: ids[i], b: ids[j], weight: 0 };
				bond.weight++;
				weights.set(key, bond);
			}
		}
	}

	return { atoms, bonds: [...weights.values()] };
}

export const molecule = build();
