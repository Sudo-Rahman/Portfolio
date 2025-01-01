export const experiences = [
    {
        entreprise: "Sweepin",
        technologies: ["Java", "kotlin", "Android", "Jetpack Compose", "PHP", "MySql"],
        poste: "Développeur Mobile/Full Stack web",
        description: "Conception et développement d'applications mobiles natives Android pour les villes intelligentes, associés à l'élaboration de solutions backend dans les projets SmartCity et IPS (Indoor Positioning System). Ces missions ont été réalisées dans le cadre d'un contrat d'alternance durant mon Master BDIA (Base de données et Intelligence Artificielle) à l'Université de Bourgogne.",
        start: 2023,
        end: "En cours",
    }
]

export const educations = [
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

export const skills = [
    "C++", "Cmake", "Qt", "Java", "Kotlin", "Android", "Jetpack Compose", "Python", "Svelte", "PHP", "SQL", "Git", "Docker"
]

export const projects = [
    {
        title: "Iridium",
        description: "Iridium est une application graphique cross platform pour la gestion de services de stockage distant tels que Google Drive, Dropbox, OneDrive, etc. Écrite en C++, utilisant le framework Qt et rclone.",
        technologies: ["C++", "Qt", "Boost", "Rclone_cpp", "Libcurl", "LibZip", "rclone", "Cmake", "Conan", "CI/CD"],
        url: "https://github.com/Sudo-Rahman/Iridium",
        img: "https://github.com/Sudo-Rahman/Iridium/blob/main/resources/Iridium.png?raw=true"
    },
    {
        title: "Rclone_cpp",
        description: "Rclone_cpp est une bibliothèque C++ pour rclone. Elle permet d'exécuter des commandes rclone, d'ajouter des parseurs pour transformer la sortie en objets, d'ajouter des options aux commandes, etc.",
        technologies: ["C++", "Boost", "rclone", "Cmake", "Conan"],
        url: "https://github.com/Sudo-Rahman/rclone_cpp"
    },
    {
        title: "Fractalium",
        description: "Fractalium est une application graphique cross platform pour la génération de fractales avec les calcules qui sont distribués sur plusieurs machines en réseau. Écrite en C++, utilisant le framework Qt et MPI.",
        technologies: ["C++", "Boost", "MPI", "Cmake"],
        url: "https://github.com/Sudo-Rahman/Fractalium",
    },
    {
        title: "6 qui prend",
        description: "Projet de systèmes et réseaux du semestre 1 de L3 informatique. Le but était de réaliser un jeu de carte en réseau. Écrit en C avec les sockets. Un ou plusieurs bots peuvent etre ajoutés.",
        technologies: ["C", "Sockets", "Linux"],
        url: "https://github.com/Sudo-Rahman/6-qui-prend"
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
        technologies: ["Java", "Sockets", "Concurrency", "Multithreading"],
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
        technologies: ["HTML5", "CSS3", "JAVASCRIPT", "PHP", "XML/JSON", "JQUERY", "SQL", "Docker"],
        url: "https://github.com/Sudo-Rahman/Projet-DAW"
    },
    {
        title: "Gold-investment",
        description: "<a class='text-blue-500' href='https://gold-investment.sudo-rahman.fr/'>Un site web</a> qui propose un calculateur d'investissement en or. Cet outil permet aux utilisateurs de simuler la croissance potentielle de leurs investissements en or en fonction de plusieurs paramètres, et une <a class='text-blue-500' href='https://gold-investment.sudo-rahman.fr/currencies' >page</a> qui permet de suivre le marché des devises modiales.",
        technologies: ["Typescript", "SvelteKit", "NodeJS", "TailwindCSS", "Github Actions", "CI/CD", "Docker"],
        url: "https://github.com/Sudo-Rahman/gold-investment"
    }
]