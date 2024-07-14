<body>
<div class="min-h-screen">
    <NavBar/>
    <ModeWatcher/>
    <div>
        <slot/>
    </div>
    <div class="sticky top-[100vh]">
        <Footer/>
    </div>
</div>
</body>

<script>
    import NavBar from "$lib/components/navBar.svelte";
    import Footer from "$lib/components/footer.svelte";
    import "../app.css";
    import {ModeWatcher} from "mode-watcher";
</script>
