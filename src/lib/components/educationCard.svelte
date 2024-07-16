<script lang="ts">

    import {Badge} from "$lib/components/ui/badge";

    export let school: string = "";
    export let description: string = "";
    export let start: string | number = "";
    export let end: string | number = "";
</script>

<div class={`${$$props.class}`}>
    <div class="w-full flex justify-between items-start">
        <div class="w-3/4 flex flex-wrap mr-4 items-center">
            <h2 class="text-2xl font-bold">{school}</h2>
        </div>
        <div class="mt-1">
            <span class="content-center whitespace-nowrap text-foreground text-opacity-80 text-justify">{start} - {end}</span>
        </div>
    </div>
    <p class="text-foreground text-opacity-80 text-justify">{description}</p>
</div>