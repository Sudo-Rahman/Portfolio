<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import type { Experience, Education } from "$lib/data/cv";
	import { formatDateRange } from "$lib/data/cv";

	type TimelineEntry = Experience | Education;

	type Props = {
		entries: TimelineEntry[];
		type: "experience" | "education";
	};

	let { entries, type }: Props = $props();
</script>

<div class="relative pl-8 border-l-2 border-border">
	{#each entries as entry, i (`${entry.location}-${type}-${i}`)}
		<AnimatedSection delay={i * 100} direction="up">
			<div class="relative mb-10 last:mb-0">
				<div
					class="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background"
				></div>

				<div class="ml-6">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
						<h3 class="text-lg font-semibold text-foreground">
							{type === "experience" ? (entry as Experience).company : (entry as Education).institution}
						</h3>
						<span class="text-xs text-muted-foreground font-medium whitespace-nowrap">
							{formatDateRange(entry)}
						</span>
					</div>

					<p class="text-sm text-primary font-medium mb-1">
						{type === "experience" ? (entry as Experience).position : `${(entry as Education).degree} — ${(entry as Education).area}`}
					</p>

					<p class="text-xs text-muted-foreground mb-2">
						{entry.location}
					</p>

					{#if entry.highlights?.length}
						<ul class="space-y-1.5 mt-3">
							{#each entry.highlights as highlight (highlight)}
									<li class="text-sm text-muted-foreground leading-relaxed flex gap-2">
										<span
											class="mt-[0.72em] h-1.5 w-1.5 rounded-full bg-primary shrink-0"
										></span>
										<span>{highlight}</span>
									</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</AnimatedSection>
	{/each}
</div>
