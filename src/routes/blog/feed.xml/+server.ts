import { posts } from "#lib/data/posts.ts";
import { AUTHOR, SITE, xmlEscape } from "#lib/data/site.ts";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
	const items = [...posts]
		.sort((a, b) => b.date.localeCompare(a.date))
		.map(
			(p) => `<item><title>${xmlEscape(p.seoTitle)}</title><link>${SITE}/blog/${p.slug}</link><guid>${SITE}/blog/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${xmlEscape(p.description)}</description></item>`,
		)
		.join("");
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Laboratoire — ${AUTHOR}</title><link>${SITE}/blog</link><description>Tests de matériel et présentations de produits.</description><language>fr-FR</language>${items}</channel></rss>`,
		{ headers: { "Content-Type": "application/rss+xml" } },
	);
};
