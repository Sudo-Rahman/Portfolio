<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import { skills } from "$lib/data/cv";
</script>

<section class="py-24 px-6">
	<div class="max-w-4xl mx-auto">
		<AnimatedSection>
			<h2 class="text-3xl font-bold mb-2">Competences</h2>
			<div class="section-divider mb-8"></div>
		</AnimatedSection>

		<div class="space-y-8">
			{#each skills as group, i}
				<AnimatedSection delay={i * 80} direction="up">
					<div>
						<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
							{group.label}
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each group.details.split(", ") as skill}
								<SkillChip label={skill} />
							{/each}
						</div>
					</div>
				</AnimatedSection>
			{/each}
		</div>
	</div>
</section>
