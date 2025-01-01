<script lang="ts">

    import {Badge} from "$lib/components/ui/badge/index.js";

    type Props = {
        class?: string,
        entreprise: string,
        technologies: string[],
        poste: string,
        description: string,
        start: string | number,
        end: string | number
    }

    let {class: className = '', entreprise, technologies, poste, description, start, end}: Props = $props();

</script>

<div class="{className}">
    <div class="w-full flex justify-between items-start">
        <div class="w-3/4 flex flex-wrap mr-4 items-center">
            <h2 class="text-2xl font-bold mr-2">{entreprise}</h2>
            {#each technologies as tech}
                <Badge class="mr-2 mt-1 content-center text-xs h-5">{tech}</Badge>
            {/each}
        </div>
        <div class="mt-1">
            <span class="content-center whitespace-nowrap text-foreground text-opacity-80 text-justify">{start}
                - {end}</span>
        </div>
    </div>
    <h3 class="text-lg">{poste}</h3>
    <p class="text-foreground text-opacity-80 text-justify">{description}</p>
</div>