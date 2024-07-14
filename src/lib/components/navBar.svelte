<script lang="ts">
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";

    import {resetMode, setMode} from "mode-watcher";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import {Button} from "$lib/components/ui/button/index.js";
</script>


<div class="w-full flex justify-center opacity-95 sticky top-5 z-50">
    <nav class="bg-accent rounded-full w-1/2 flex p-1">
        <div class="w-full flex justify-end mr-5">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="outline" size="icon">
                        <Sun
                                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                        />
                        <Moon
                                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                        />
                        <span class="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" class="rounded-2xl">
                    <DropdownMenu.Item on:click={() => setMode("light")}
                    >Light
                    </DropdownMenu.Item
                    >
                    <DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
                    <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </nav>
</div>
