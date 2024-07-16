    <script>
    import NavBar from "$lib/components/navBar.svelte";
    import Footer from "$lib/components/footer.svelte";
    import "../app.css";
    import {ModeWatcher} from "mode-watcher";
</script>


<body class="glassmorphic-background">
<div class="min-h-screen">
    <NavBar/>
    <ModeWatcher/>
    <div class="p-10">
        <slot/>
    </div>
    <div class="sticky top-[100vh]">
        <Footer/>
    </div>
</div>
</body>