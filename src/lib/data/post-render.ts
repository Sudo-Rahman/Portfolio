import { renderReport } from "./report.ts";

/** Renders a blog article: report typography plus side-by-side galleries for consecutive figures. */
export function renderPost(markdown: string) {
	const { html, toc } = renderReport(markdown);
	// A figure is exactly an <img> plus an optional caption: the pattern must never run across other markup.
	const figure = String.raw`<span class="figure[^"]*"><img[^>]*>(?:<span class="caption">[^<]*</span>)?</span>`;
	const gallery = new RegExp(String.raw`<p>\s*((?:${figure}\s*){2,})</p>`, "g");
	const words = markdown.replace(/[#*_>`|-]|!?\[[^\]]*\]\([^)]*\)/g, " ").split(/\s+/).filter(Boolean).length;
	return {
		html: html
			.replace(gallery, (_, figures: string) => `<div class="gallery">${figures}</div>`)
			.replace(new RegExp(String.raw`<p>\s*(${figure})\s*</p>`, "g"), "$1"),
		toc,
		minutes: Math.max(1, Math.round(words / 200)),
	};
}
