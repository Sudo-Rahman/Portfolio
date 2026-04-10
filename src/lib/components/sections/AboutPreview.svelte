<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import MapPin from "lucide-svelte/icons/map-pin";
	import Briefcase from "lucide-svelte/icons/briefcase";
</script>

<section class="py-24 px-6">
	<div class="max-w-4xl mx-auto">
		<AnimatedSection>
			<h2 class="text-3xl font-bold mb-2">A propos</h2>
			<div class="section-divider mb-8"></div>
		</AnimatedSection>

		<AnimatedSection delay={100}>
			<p class="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
				Developpeur full stack et mobile diplome d'un Master 2 en Bases de
				Donnees et Intelligence Artificielle. 2 ans d'alternance chez Sweepin
				puis deux missions freelance pour une startup IA, autour d'un SaaS et
				de pipelines d'indexation pour LLM. J'aime concevoir des produits de
				bout en bout, de l'interface a l'infrastructure, avec autonomie et
				exigence technique.
			</p>
		</AnimatedSection>

		<AnimatedSection delay={200}>
			<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
				<span class="inline-flex items-center gap-2">
					<MapPin class="h-4 w-4 text-primary" />
					Chalon-sur-Saone, France
				</span>
				<span class="inline-flex items-center gap-2">
					<Briefcase class="h-4 w-4 text-primary" />
					Freelance &middot; Disponible
				</span>
			</div>
		</AnimatedSection>
	</div>
</section>
