<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import MapPin from "lucide-svelte/icons/map-pin";
	import Briefcase from "lucide-svelte/icons/briefcase";
</script>

<section id="about" class="py-24 px-6">
	<div class="max-w-4xl mx-auto">
		<AnimatedSection>
			<h2 class="text-3xl font-bold mb-2">À propos</h2>
			<div class="section-divider mb-8"></div>
		</AnimatedSection>

		<AnimatedSection delay={100}>
			<p class="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
				Ingénieur logiciel Bac+5 en Bases de Données et Intelligence
				Artificielle. Deux ans d'alternance chez Sweepin sur des applications
				mobiles et web multi-clients, puis des missions freelance autour d'un
				SaaS et de pipelines IA. J'intègre Codex App dans un workflow de
				développement agentique pour accélérer l'implémentation et itérer sur
				les choix techniques.
			</p>
		</AnimatedSection>

		<AnimatedSection delay={200}>
			<div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
				<span class="inline-flex items-center gap-2">
					<MapPin class="h-4 w-4 text-primary" />
					Chalon-sur-Saône, France
				</span>
				<span class="inline-flex items-center gap-2">
					<Briefcase class="h-4 w-4 text-primary" />
					Freelance &middot; Disponible
				</span>
			</div>
		</AnimatedSection>
	</div>
</section>
