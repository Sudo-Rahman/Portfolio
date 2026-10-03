import { error } from "@sveltejs/kit";
import { getPost, neighbours, posts } from "#lib/data/posts.ts";
import { renderPost } from "#lib/data/post-render.ts";
import type { EntryGenerator, PageLoad } from "./$types";

export const entries: EntryGenerator = () => posts.map((post) => ({ slug: post.slug }));

const articles = import.meta.glob("../../../../blog/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
}) as Record<string, string>;

export const load: PageLoad = ({ params }) => {
	const post = getPost(params.slug);
	if (!post) error(404, "Article introuvable");

	const raw = Object.entries(articles).find(([path]) => path.endsWith(`/${params.slug}.md`))?.[1];
	if (!raw) error(404, "Article introuvable");

	const { html, toc, minutes } = renderPost(raw);
	// Spec sheet and verdict are rendered from the post data, after the prose.
	const extra = [{ id: "fiche-technique", text: "Fiche technique" }, ...(post.rating ? [{ id: "note", text: "La note" }] : [])];
	return { post, html, toc: [...toc, ...extra], minutes, ...neighbours(post) };
};
