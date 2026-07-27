import {
	getProject,
	hasProjectDetails,
	projects,
} from "$lib/data/projects";
import { error } from "@sveltejs/kit";
import type { PageLoad, EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
	return projects
		.filter(hasProjectDetails)
		.map((project) => ({ slug: project.slug }));
};

export const prerender = true;

const reportModules = import.meta.glob("../../../../project-reports/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
}) as Record<string, string>;

export const load: PageLoad = ({ params }) => {
	const project = getProject(params.slug);
	if (!project || !hasProjectDetails(project)) {
		error(404, "Projet non trouve");
	}

	let content: string | undefined;
	for (const [path, raw] of Object.entries(reportModules)) {
		if (path.endsWith(`/${params.slug}.md`)) {
			content = raw;
			break;
		}
	}

	if (!content) {
		error(404, "Rapport non trouve");
	}

	return { project, content };
};
