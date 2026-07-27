<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import { profile } from "$lib/data/cv";
	import MapPin from "lucide-svelte/icons/map-pin";
</script>

<section id="about" class="py-24 px-6">
	<div class="max-w-4xl mx-auto">
		<AnimatedSection>
			<h2 class="text-3xl font-bold mb-2">À propos</h2>
			<div class="section-divider mb-8"></div>
		</AnimatedSection>

		<AnimatedSection delay={100}>
			<div class="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl space-y-4">
				{#each profile.summary as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</AnimatedSection>

		<AnimatedSection delay={200}>
			<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
				<span class="inline-flex items-center gap-2">
					<MapPin class="h-4 w-4 text-primary" />
					Chalon-sur-Saône, France
				</span>
			</div>
		</AnimatedSection>
	</div>
</section>
