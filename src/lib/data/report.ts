import { Marked } from "marked";

export interface TocEntry {
	id: string;
	text: string;
}

function slugify(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/<[^>]+>/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Renders a project report: anchored headings, a table of contents, external links in new tabs. */
export function renderReport(markdown: string): { html: string; toc: TocEntry[] } {
	const toc: TocEntry[] = [];
	const used = new Set<string>();

	const marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth, text }) {
				// The page header already shows the title.
				if (depth === 1) return "";
				let id = slugify(text) || "section";
				while (used.has(id)) id += "-";
				used.add(id);
				if (depth === 2) toc.push({ id, text: text.replace(/[*_`]/g, "") });
				return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
			},
			link({ href, title, tokens }) {
				const external = /^https?:\/\//.test(href);
				const attrs = [
					`href="${escapeAttr(href)}"`,
					title ? `title="${escapeAttr(title)}"` : "",
					external ? 'target="_blank" rel="noreferrer"' : "",
				];
				return `<a ${attrs.filter(Boolean).join(" ")}>${this.parser.parseInline(tokens)}</a>`;
			},
			image({ href, text, title }) {
				const caption = text ? `<span class="caption">${text}</span>` : "";
				// The optional markdown title doubles as a modifier class (e.g. "portrait").
				return `<span class="figure${title ? ` ${escapeAttr(title)}` : ""}"><img src="${escapeAttr(href)}" alt="${escapeAttr(text)}" loading="lazy" decoding="async" />${caption}</span>`;
			},
		},
	});

	const html = marked
		.parse(markdown, { async: false })
		// Wide tables scroll horizontally instead of breaking the layout on phones.
		.replaceAll("<table>", '<div class="table-scroll"><table>')
		.replaceAll("</table>", "</table></div>");
	return { html, toc };
}
