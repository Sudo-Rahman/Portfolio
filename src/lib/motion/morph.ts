/**
 * Shared-element page transitions: any element carrying `data-morph="<slug>"`
 * morphs into the element with the same slug on the next page.
 * Names are assigned just in time so only one element per slug is tagged.
 */
function inViewport(el: Element): boolean {
	const r = el.getBoundingClientRect();
	return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width > 0;
}

export function tagMorphs(slugs: (string | undefined)[]): void {
	for (const slug of new Set(slugs)) {
		if (!slug) continue;
		const candidates = document.querySelectorAll<HTMLElement>(`[data-morph="${CSS.escape(slug)}"]`);
		const el = [...candidates].find(inViewport);
		if (el) el.style.viewTransitionName = `el-${slug.replace(/[^\w-]/g, "")}`;
	}
}

export function clearMorphs(): void {
	document.querySelectorAll<HTMLElement>("[data-morph]").forEach((el) => {
		el.style.viewTransitionName = "";
	});
}
