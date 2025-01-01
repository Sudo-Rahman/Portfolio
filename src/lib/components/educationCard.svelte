<script lang="ts">

    type Props = {
        class?: string,
        school: string,
        description: string,
        start: string | number,
        end: string | number
    };

    let {class : className = '', school, description, start, end}: Props = $props();

</script>

<div class="{className}">
    <div class="w-full flex justify-between items-start">
        <div class="w-3/4 flex flex-wrap mr-4 items-center">
            <h2 class="text-2xl font-bold">{school}</h2>
        </div>
        <div class="mt-1">
            <span class="content-center whitespace-nowrap text-foreground text-opacity-80 text-justify">{start}
                - {end}</span>
        </div>
    </div>
    <p class="text-foreground text-opacity-80 text-justify">{description}</p>
</div>