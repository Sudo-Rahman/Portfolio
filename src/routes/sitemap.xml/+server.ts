import { hasProjectDetails, projects } from "#lib/data/projects.ts";
import { posts } from "#lib/data/posts.ts";
import { SITE } from "#lib/data/site.ts";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
	const urls = [
		{ loc: "/" },
		{ loc: "/projects" },
		{ loc: "/cv" },
		{ loc: "/blog", lastmod: posts.map((p) => p.updated ?? p.date).sort().at(-1) },
		...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.updated ?? p.date })),
		...projects.filter(hasProjectDetails).map((p) => ({ loc: `/projects/${p.slug}` })),
	];
	const body = urls
		.map((u) => `<url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
		.join("");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
		{ headers: { "Content-Type": "application/xml" } },
	);
};
