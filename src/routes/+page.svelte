<script lang="ts">
    import ExperienceCard from "$lib/components/experienceCard.svelte";
    import EducationCard from "$lib/components/educationCard.svelte";
    import {Badge} from "$lib/components/ui/badge";
    import Autoplay from "embla-carousel-autoplay";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import type {CarouselAPI} from "$lib/components/ui/carousel/context.js";
    import ProjectCard from "$lib/components/projectCard.svelte";
    import {experiences, educations, skills, projects} from "./data";


    const plugin = Autoplay({delay: 10000, stopOnInteraction: true});

    let api = $state<CarouselAPI>();
    let current = $state(0);
    let count = $state(0);

    $effect(() => {
        if (api) {
            current = api.selectedScrollSnap() + 1;
            count = api.scrollSnapList().length;
            api.on("select", () => {
                current = api!.selectedScrollSnap() + 1;
            });
        }
    });


</script>

<title>Sudo-Rahman</title>

<div class="w-full flex justify-center mt-12">

    <div class="w-full lg:w-3/4">
        <h1 class="text-4xl font-bold mb-2">Rahman Yilmaz</h1>
        <p class="text-foreground text-opacity-80">Développeur Mobile/Full Stack web</p>
        <p class="text-foreground text-opacity-80 mb-24">Dijon, France</p>

        <h2 class="text-3xl font-bold mb-2">À propos</h2>
        <p class="text-foreground text-opacity-80 text-justify mb-24">Étudiant de 22 ans, je suis actuellement en
            deuxième année de Master Informatique, option Bases de Données et
            Intelligence Artificielle, à l'Université de Bourgogne. Passionné par les technologies depuis mon enfance,
            j'ai découvert l'informatique en licence et j'ai immédiatement été captivé par ses possibilités
            infinies.
            Aujourd'hui, je suis en contrat d'apprentissage au sein de l'entreprise Sweepin, où je travaille en tant que
            développeur Mobile/Full Stack web sur les projets SmartCity et IPS.
            Vous trouverez ci-dessous mon CV ainsi que des informations détaillées sur mes projets, qui illustrent mon
            parcours et mes compétences en informatique.</p>

        <h2 class="text-3xl font-bold mb-2">Expériences</h2>
        <p class="text-foreground text-opacity-80 text-justify mb-2"></p>
        <div class="flex flex-col mb-12">
            {#each experiences as exp}
                <ExperienceCard class={exp === experiences[experiences.length - 1] ? '' : 'mb-4'}
                                entreprise={exp.entreprise}
                                technologies={exp.technologies}
                                poste={exp.poste}
                                description={exp.description}
                                start={exp.start}
                                end={exp.end}
                />
            {/each}
        </div>

        <h2 class="text-3xl font-bold mb-2">Formations</h2>
        <div class="flex flex-col mb-12">
            {#each educations as edu}
                <EducationCard class="mb-4" school={edu.school} description={edu.description} start={edu.start}
                               end={edu.end}/>
            {/each}
        </div>

        <h2 class="text-3xl font-bold">Compétences</h2>
        <div class="flex flex-wrap mb-12">
            {#each skills as skill}
                <Badge class="mt-2 mr-2">{skill}</Badge>
            {/each}
        </div>

        <h2 class="text-3xl font-bold mb-2">Projets</h2>
        <div class="w-full flex justify-center">
            <div class="w-[80%] lg:w-full">
                <Carousel.Root setApi={(emblaApi) => (api = emblaApi)}
                               class="w-full"
                               onmouseleave={plugin.reset}
                               onmouseenter={plugin.stop}
                               plugins={[plugin]}
                >
                    <Carousel.Content>
                        {#each projects as project}
                            <Carousel.Item class="max-w-xs sm:max-w-[25rem] lg:max-w-[30rem]">
                                <div class="p-1">
                                    <ProjectCard class="flex aspect-[4/3] px-2" title={project.title}
                                                 description={project.description} technologies={project.technologies}
                                                 url={project.url} image={project.img}/>
                                </div>
                            </Carousel.Item>
                        {/each}
                    </Carousel.Content>
                    <Carousel.Previous/>
                    <Carousel.Next/>
                </Carousel.Root>
                <div class="py-3 text-center text-sm text-muted-foreground">
                    Slide {current} / {count}
                </div>
            </div>
        </div>
    </div>
</div>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rahman Yilmaz - Développeur Mobile/Full Stack Web</title>
    <meta name="description" content="Portfolio de Rahman Yilmaz, développeur mobile et full stack web basé à Dijon, France. Découvrez mes projets, compétences et expériences professionnelles.">
    <meta name="keywords" content="Rahman Yilmaz, développeur, mobile, full stack, web, C++, Java, Kotlin, Android, Svelte, PHP, SQL, Docker, Dijon, France">
    <meta name="author" content="Rahman Yilmaz">
    <meta property="og:title" content="Rahman Yilmaz - Développeur Mobile/Full Stack Web">
    <meta property="og:description" content="Découvrez le portfolio de Rahman Yilmaz, développeur mobile et full stack web, incluant ses projets et compétences.">
    <meta property="og:url" content="https://sudo-rahman.fr/">
    <meta property="og:type" content="website">
</svelte:head>