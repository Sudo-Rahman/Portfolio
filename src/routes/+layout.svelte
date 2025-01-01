    <script>
    import NavBar from "$lib/components/navBar.svelte";
    import Footer from "$lib/components/footer.svelte";
    import "../app.css";
    import {ModeWatcher} from "mode-watcher";

    let {children} = $props();
</script>


<div class="min-h-screen">
    <NavBar/>
    <ModeWatcher/>
    <div class="px-5 py-10">
        {@render children()}
    </div>
    <div class="sticky top-[100vh]">
        <Footer/>
    </div>
</div>
