<script lang="ts">
    import ExperienceCard from "\$lib/components/experienceCard.svelte";
    import EducationCard from "\$lib/components/educationCard.svelte";

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
    </div>
</div>