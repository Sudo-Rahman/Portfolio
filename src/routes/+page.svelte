<script lang="ts">
    import ExperienceCard from "\$lib/components/experienceCard.svelte";
    import EducationCard from "\$lib/components/educationCard.svelte";
    import {Badge} from "$lib/components/ui/badge";
    import Autoplay from "embla-carousel-autoplay";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import type {CarouselAPI} from "$lib/components/ui/carousel/context.js";
    import ProjectCard from "$lib/components/projectCard.svelte";

    const experiences = [
        {
            entreprise: "Sweepin",
            technologies: ["Java", "kotlin", "Jetpack Compose", "PHP", "MySql"],
            poste: "Développeur Full Stack",
            description: "Conception et développement d'applications mobiles natives Android pour les villes intelligentes, associés à l'élaboration de solutions backend dans les projets SmartCity et IPS (Indoor Positioning System). Ces missions ont été réalisées dans le cadre d'un contrat d'alternance durant mon Master BDIA (Big Data et Intelligence Artificielle) à l'Université de Bourgogne.",
            start: 2023,
            end: "En cours",
        }
    ]

    const educations = [
        {
            school: "Université de Bourgogne - Dijon",
            start: 2023,
            end: "En cours",
            description: "Master Informatique option Bases de Données et Intelligence Artificielle"
        },
        {
            school: "Université de Bourgogne - Dijon",
            start: 2020,
            end: 2023,
            description: "Licence Informatique"
        },
        {
            school: "Lycée privé catholique Saint Charles - Chalon-sur-Saône",
            start: 2017,
            end: 2020,
            description: "Baccalauréat S-Scientifique option mathématiques"
        }
    ];

    const skills = [
        "C++", "Cmake", "Qt", "Java", "Kotlin", "Android", "Jetpack Compose", "Python", "Svelte", "PHP", "SQL", "Git","Docker"
    ]


    const plugin = Autoplay({delay: 10000, stopOnInteraction: true});

    let api: CarouselAPI;
    let current = 0;
    let count = 0;

    $: if (api) {
        count = api.scrollSnapList().length;
        current = api.selectedScrollSnap() + 1;

        api.on("select", () => {
            current = api.selectedScrollSnap() + 1;
        });
    }

    const projects = [
        {
            title: "Iridium",
            description: "Iridium est une application graphique cross platform pour la gestion de services de stockage distant tels que Google Drive, Dropbox, OneDrive, etc. Écrite en C++, utilisant le framework Qt et rclone.",
            technologies: ["C++", "Qt", "Boost", "Rclone_cpp", "Libcurl", "LibZip", "rclone", "Cmake", "Conan", "CI/CD"],
            url : "https://github.com/Sudo-Rahman/Iridium",
            img : "https://github.com/Sudo-Rahman/Iridium/blob/main/resources/Iridium.png?raw=true"
        },
        {
            title: "Rclone_cpp",
            description: "Rclone_cpp est une bibliothèque C++ pour rclone. Elle permet d'exécuter des commandes rclone, d'ajouter des parseurs pour transformer la sortie en objets, d'ajouter des options aux commandes, etc.",
            technologies: ["C++", "Boost", "rclone", "Cmake", "Conan"],
            url : "https://github.com/Sudo-Rahman/rclone_cpp"
        },
        {
            title: "Fractalium",
            description: "Fractalium est une application graphique cross platform pour la génération de fractales avec les calcules qui sont distribués sur plusieurs machines en réseau. Écrite en C++, utilisant le framework Qt et MPI.",
            technologies: ["C++", "Boost", "MPI", "Cmake"],
            url : "https://github.com/Sudo-Rahman/Fractalium",
        },
        {
            title: "6 qui prend",
            description: "Projet de systèmes et réseaux du semestre 1 de L3 informatique. Le but était de réaliser un jeu de carte en réseau. Écrit en C avec les sockets. Un ou plusieurs bots peuvent etre ajoutés.",
            technologies: ["C", "Sockets", "Linux"],
            url : "https://github.com/Sudo-Rahman/6-qui-prend"
        },
        {
            title: "kotlin-meteo",
            description: "Application Android pour la consultation de la météo. Écrite en Kotlin, utilisant l'API Open-meteo API.",
            technologies: ["Kotlin", "Android", "Retrofit", "Open-meteo API"],
            url: "https://github.com/Sudo-Rahman/kotlin-meteo",
            img: "https://github.com/Sudo-Rahman/kotlin-meteo/blob/main/app/src/main/res/drawable/day_partial_cloud.png?raw=true"
        },
        {
            title: "Lichess-Data",
            description: "Projet universitaire de programmation concurrente. Un serveur, gère les connexions d'un ou plusieurs clients, les clients effectuent des requêtes en rapport avec les echecs, le serveur cherchera dans un fichier texte au format pgn les données voulu du client et lui enverra les informations.",
            technologies: ["Java", "Sockets","Concurrency", "Multithreading"],
            url: "https://github.com/Sudo-Rahman/Lichess-Data"
        },
        {
            title: "Cadmium",
            description: "Todo list en Angular sans librairies de composants ni Backend. Tests Lint et CI/CD avec GitHub Actions.",
            technologies: ["Typescript", "Angular", "TailwindCSS", "Github Actions", "CI/CD"],
            url: "https://github.com/Sudo-Rahman/Projet-CWA"
        },
        {
            title: "Titanium",
            description: "Application graphique multi plateforme de gestion de contact écrite en c++ et en utilisant le framwork Qt.",
            technologies: ["C++", "Qt"],
            url: "https://github.com/Sudo-Rahman/Titanium",
            img: "https://github.com/Sudo-Rahman/QT_L3/blob/main/images/app.ico?raw=true"
        },
        {
            title: "Projet-DAW",
            description: "Projet réalisé dans le cadre du module Développement Applications Web à l'Université de Bourgogne Franche Comté. Ce site a été créé pour aider les apprenants à développer leurs compétences. Il propose des cours en ligne interactifs, des exercices pratiques et des ressources supplémentaires pour renforcer les connaissances acquises.",
            technologies: ["HTML5", "CSS3","JAVASCRIPT","PHP", "XML/JSON", "JQUERY", "SQL", "Docker"],
            url: "https://github.com/Sudo-Rahman/Projet-DAW"
        }
    ]

</script>

<title>Sudo-Rahman</title>

<div class="w-full flex justify-center">

    <div class="w-full lg:w-3/4">
        <h1 class="text-4xl font-bold mb-2">Rahman Yilmaz</h1>
        <p class="text-foreground text-opacity-80">Développeur Full Stack</p>
        <p class="text-foreground text-opacity-80 mb-5">Dijon, France</p>

        <h2 class="text-3xl font-bold mb-2">À propos</h2>
        <p class="text-foreground text-opacity-80 text-justify mb-5">Étudiant de 22 ans, je suis actuellement en
            deuxième année de Master Informatique, option Bases de Données et
            Intelligence Artificielle, à l'Université de Bourgogne. Passionné par les technologies depuis mon enfance,
            j'ai découvert l'informatique en licence et j'ai immédiatement été captivé par ses possibilités
            infinies.
            Aujourd'hui, je suis en contrat d'apprentissage au sein de l'entreprise Sweepin, où je travaille en tant que
            développeur Full Stack sur les projets SmartCity et IPS.
            Vous trouverez ci-dessous mon CV ainsi que des informations détaillées sur mes projets, qui illustrent mon
            parcours et mes compétences en informatique.</p>

        <h2 class="text-3xl font-bold mb-2">Expériences</h2>
        <p class="text-foreground text-opacity-80 text-justify mb-2"></p>
        {#each experiences as exp}
            <ExperienceCard class="mb-5"
                            entreprise={exp.entreprise}
                            technologies={exp.technologies}
                            poste={exp.poste}
                            description={exp.description}
                            start={exp.start}
                            end={exp.end}
            />
        {/each}

        <h2 class="text-3xl font-bold mb-2">Formations</h2>
        {#each educations as edu}
            <EducationCard class="mb-2" school={edu.school} description={edu.description} start={edu.start}
                           end={edu.end}/>
        {/each}

        <h2 class="text-3xl font-bold">Compétences</h2>
        <div class="flex flex-wrap space-x-2 mb-5">
            {#each skills as skill}
                <Badge class="mt-2">{skill}</Badge>
            {/each}
        </div>

        <h2 class="text-3xl font-bold mb-2">Projets</h2>
        <div class="w-full flex justify-center">
            <div class="w-[80%] lg:w-full">
                <Carousel.Root bind:api
                               plugins={[plugin]}
                               class="w-full"
                               on:mousenter={plugin.stop}
                               on:mouseleave={plugin.reset}
                >
                    <Carousel.Content>
                        {#each projects as project}
                            <Carousel.Item class="max-w-xs sm:max-w-[25rem] lg:max-w-[30rem]">
                                <div class="p-1">
                                    <ProjectCard class="flex aspect-[4/3] px-2" title={project.title}
                                                 description={project.description} technologies={project.technologies} url={project.url} image={project.img}/>
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