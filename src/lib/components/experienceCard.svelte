<script lang="ts">

    import {Badge} from "$lib/components/ui/badge/index.js";

    export let entreprise: string = "";
    export let technologies: string[] = [];
    export let poste: string = "";
    export let description: string = "";
    export let start: string | number = "";
    export let end: string | number = "";
</script>

<div class={`${$$props.class}`}>
    <div class="w-full flex justify-between items-start">
        <div class="w-3/4 flex flex-wrap mr-4 items-center">
            <h2 class="text-2xl font-bold">{entreprise}</h2>
            {#each technologies as tech}
                <Badge class="ml-2 content-center text-xs h-5">{tech}</Badge>
            {/each}
        </div>
        <div class="mt-1">
            <span class="content-center whitespace-nowrap text-foreground text-opacity-80 text-justify">{start} - {end}</span>
        </div>
    </div>
    <h3 class="text-lg">{poste}</h3>
    <p class="text-foreground text-opacity-80 text-justify">{description}</p>
</div>