import { error } from "@sveltejs/kit";
import { getProject, hasProjectDetails, neighbours, projects } from "#lib/data/projects.ts";
import { renderReport } from "#lib/data/report.ts";
import type { EntryGenerator, PageLoad } from "./$types";

export const entries: EntryGenerator = () =>
	projects.filter(hasProjectDetails).map((project) => ({ slug: project.slug }));

const reports = import.meta.glob("../../../../project-reports/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
}) as Record<string, string>;

export const load: PageLoad = ({ params }) => {
	const project = getProject(params.slug);
	if (!project || !hasProjectDetails(project)) error(404, "Élément introuvable");

	const raw = Object.entries(reports).find(([path]) => path.endsWith(`/${params.slug}.md`))?.[1];
	if (!raw) error(404, "Rapport introuvable");

	return { project, ...neighbours(project), ...renderReport(raw) };
};
