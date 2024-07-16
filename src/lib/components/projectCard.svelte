<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js"
    import {Badge} from "$lib/components/ui/badge/index.js"

    export let title: string = "";
    export let description: string = "";
    export let technologies: string[] = []
</script>

<Card.Root class={`${$$props.class}`}>
    <Card.Content class="h-full p-3 sm:p-4 lg:p-5 overflow-y-auto flex flex-col">

        <div>
            <a href="/"
               class="text-2xl font-bold mb-2 relative transition-all ease-in-out before:transition-[width] before:ease-in-out before:duration-500 before:absolute before:bg-gray-400 before:origin-center before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] after:transition-[width] after:ease-in-out after:duration-500 after:absolute after:bg-gray-400 after:origin-center after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%]">{title}</a>
        </div>

        <p class="text-justify flex-grow">{description}</p>

        <div class="flex flex-wrap mt-2 items-end">
            {#each technologies as tech}
                <Badge class="mt-2 mr-1 text-xs h-5">{tech}</Badge>
            {/each}
        </div>

    </Card.Content>
</Card.Root>