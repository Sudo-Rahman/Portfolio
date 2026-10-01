// Import the rendercv function and all the refactored components
#import "@preview/rendercv:0.3.0": *

// Apply the rendercv template with custom configuration
#show: rendercv.with(
  name: "Rahman YILMAZ",
  title: "Rahman YILMAZ - CV",
  footer: context { [#emph[Rahman YILMAZ -- #str(here().page())\/#str(counter(page).final().first())]] },
  top-note: [ #emph[Dernière mise à jour Oct 2026] ],
  locale-catalog-language: "fr",
  text-direction: ltr,
  page-size: "a4",
  page-top-margin: 0.7in,
  page-bottom-margin: 0.7in,
  page-left-margin: 0.7in,
  page-right-margin: 0.7in,
  page-show-footer: true,
  page-show-top-note: false,
  colors-body: rgb(0, 0, 0),
  colors-name: rgb(0, 79, 144),
  colors-headline: rgb(0, 79, 144),
  colors-connections: rgb(0, 79, 144),
  colors-section-titles: rgb(0, 79, 144),
  colors-links: rgb(0, 79, 144),
  colors-footer: rgb(128, 128, 128),
  colors-top-note: rgb(128, 128, 128),
  typography-line-spacing: 0.6em,
  typography-alignment: "left",
  typography-date-and-location-column-alignment: right,
  typography-font-family-body: "Source Sans 3",
  typography-font-family-name: "Source Sans 3",
  typography-font-family-headline: "Source Sans 3",
  typography-font-family-connections: "Source Sans 3",
  typography-font-family-section-titles: "Source Sans 3",
  typography-font-size-body: 10pt,
  typography-font-size-name: 26pt,
  typography-font-size-headline: 10pt,
  typography-font-size-connections: 10pt,
  typography-font-size-section-titles: 1.3em,
  typography-small-caps-name: false,
  typography-small-caps-headline: false,
  typography-small-caps-connections: false,
  typography-small-caps-section-titles: false,
  typography-bold-name: true,
  typography-bold-headline: false,
  typography-bold-connections: false,
  typography-bold-section-titles: true,
  links-underline: false,
  links-show-external-link-icon: false,
  header-alignment: center,
  header-photo-width: 3.5cm,
  header-space-below-name: 0.5cm,
  header-space-below-headline: 0.5cm,
  header-space-below-connections: 0.5cm,
  header-connections-hyperlink: true,
  header-connections-show-icons: true,
  header-connections-display-urls-instead-of-usernames: false,
  header-connections-separator: "",
  header-connections-space-between-connections: 0.5cm,
  section-titles-type: "with_partial_line",
  section-titles-line-thickness: 0.5pt,
  section-titles-space-above: 0.4cm,
  section-titles-space-below: 0.2cm,
  sections-allow-page-break: true,
  sections-space-between-text-based-entries: 0.3em,
  sections-space-between-regular-entries: 1em,
  entries-date-and-location-width: 4.15cm,
  entries-side-space: 0.2cm,
  entries-space-between-columns: 0.1cm,
  entries-allow-page-break: false,
  entries-short-second-row: true,
  entries-degree-width: 2.5cm,
  entries-summary-space-left: 0cm,
  entries-summary-space-above: 0cm,
  entries-highlights-bullet:  "•" ,
  entries-highlights-nested-bullet:  "•" ,
  entries-highlights-space-left: 0.15cm,
  entries-highlights-space-above: 0cm,
  entries-highlights-space-between-items: 0cm,
  entries-highlights-space-between-bullet-and-text: 0.5em,
  date: datetime(
    year: 2026,
    month: 10,
    day: 1,
  ),
)


= Rahman YILMAZ

  #headline([Développeur Full Stack \/ Android])

#connections(
  [#connection-with-icon("location-dot")[Chalon-sur-Saône, France]],
  [#link("mailto:contact@rahman.ovh", icon: false, if-underline: false, if-color: false)[#connection-with-icon("envelope")[contact\@rahman.ovh]]],
  [#link("tel:+33-7-81-38-88-82", icon: false, if-underline: false, if-color: false)[#connection-with-icon("phone")[07 81 38 88 82]]],
  [#link("https://sudo-rahman.fr/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("link")[sudo-rahman.fr]]],
  [#link("https://github.com/Sudo-Rahman", icon: false, if-underline: false, if-color: false)[#connection-with-icon("github")[Sudo-Rahman]]],
  [#link("https://www.linkedin.com/in/rahman-yilmaz-9236ab270/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("linkedin")[LinkedIn]]],
)


== Profil

Développeur Full Stack \/ Android, titulaire d'un Master en informatique. J'ai passé deux ans en alternance chez Sweepin sur des applications SmartCity et e-santé : apps Android, back-offices PHP\/Symfony, APIs REST et interfaces SvelteKit. Depuis septembre 2025, je développe et je vends mes propres logiciels.

En dehors du code, je m'occupe aussi du matériel : serveur et NAS à la maison, réseau, domotique. J'aime comprendre comment les choses fonctionnent et les installer moi-même.

== Compétences

#strong[Android:] Kotlin, Java, Jetpack Compose, Clean Architecture, Gradle

#strong[Full Stack web:] PHP, Symfony, Doctrine ORM, APIs REST, MariaDB\/MySQL, PostgreSQL, JavaScript\/TypeScript, SvelteKit, HTML\/CSS, Node.js, Prisma, Redis

#strong[Tests & livraison:] Tests unitaires et d'intégration, Docker, CI\/CD, GitHub Actions, Linux\/Unix, debugging, documentation, mise en production

#strong[Logiciel & desktop:] Rust, Tauri 2, C++23, Qt 6, FFmpeg, rclone, CMake, Conan

#strong[Data, IA & automatisation:] Python, Pandas, SQL, OCR, transcription, traduction IA, pipelines LLM, BullMQ

#strong[Langues:] Français (natif), Turc (bilingue), Anglais B2

== Expérience

#regular-entry(
  [
    #strong[Solo Agilis Sweepin], Développeur Android & Full Stack

    - Maintenance et évolution des applications Android SmartCity en tant que mainteneur principal : intégration de nouveaux clients, création de modules, correction d'anomalies et publication de versions

    - Développement et maintenance des back-offices et APIs SmartCity et e-santé avec PHP\/Symfony, Doctrine ORM, MariaDB, JavaScript, HTML et CSS

    - Amélioration et maintenance du viewer e-santé, ainsi que développement d'interfaces web avec JavaScript\/TypeScript et SvelteKit

    - Intervention sur l'ensemble du cycle applicatif : analyse des besoins, chiffrage, développement, tests, recette, documentation et mise en production, en collaboration avec les équipes métier, mobile et backend

  ],
  [
    Dijon, France

    Sep 2023 – Sep 2025

  ],
)

#regular-entry(
  [
    #strong[Steerway], Développeur logiciel freelance

    - Développement d'une plateforme SaaS avec SvelteKit\/TypeScript, authentification, tableau de bord client, PostgreSQL\/Prisma et gestion de licences

    - Intégration des paiements Paddle et mise en place d'une architecture événementielle avec Redis, BullMQ et Resend

    - Développement en Python d'un pipeline de collecte et de normalisation de documentations techniques issues de npm\/PyPI, de dépôts Git, de README, de sites web et de fichiers llms.txt, avec prise en charge des monorepos

    - Conception en Python d'un système de benchmark et de traitement par lots : jeux de référence, métriques de validation, parallélisation, délais maximums, reprise sur erreur et optimisation des ressources

  ],
  [
    Remote

    Nov 2025 – Jan 2026

  ],
)

#regular-entry(
  [
    #strong[Indépendant], Développeur & éditeur de logiciels

    - Conception, développement et commercialisation de logiciels destinés aux particuliers, de l'architecture à la maintenance

    - Développement d'applications desktop, mobiles et web avec Tauri\/Rust, SvelteKit, SwiftUI et Kotlin selon les besoins

    - Mise en place des tests, de l'intégration continue, du packaging, de la documentation et du suivi des versions

    - Gestion de la commercialisation des produits : paiements Stripe, pages produit, SEO technique, campagnes publicitaires et suivi des conversions

  ],
  [
    Remote

    Sep 2025 – présent

  ],
)

== Formation

#education-entry(
  [
    #strong[Université de Bourgogne \/ Université de Bourgogne Europe], Informatique - Bases de Données et Intelligence Artificielle

  ],
  [
    Dijon, France

    Sep 2023 – Sep 2025

  ],
  degree-column: [
    #strong[Master]
  ],
)

#education-entry(
  [
    #strong[Université de Bourgogne], Informatique

  ],
  [
    Dijon, France

    2023

  ],
  degree-column: [
    #strong[Licence]
  ],
)

#education-entry(
  [
    #strong[Lycée privé catholique], Série scientifique

  ],
  [
    Chalon-sur-Saône, France

    2020

  ],
  degree-column: [
    #strong[Baccalauréat]
  ],
)

== Projets

#regular-entry(
  [
    #strong[Ultra Explorer]

    #summary[Gestionnaire de fichiers multi-cloud commercialisé (abonnement Pro et licence à vie via Stripe), deuxième version de mon client rclone après Iridium (C++23\/Qt 6) : cœur Rust partagé entre une application desktop Tauri 2 et un serveur Axum auto-hébergeable via Docker, interface SvelteKit, explorateur double panneau, file de transferts durable, synchronisations planifiées, plus de 1 300 tests Rust et CI multi-OS]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[KARA]

    #summary[Application iPhone publiée sur l'App Store pour l'inventaire de métaux précieux : Swift\/SwiftUI, SwiftData et iCloud, widgets, API SvelteKit\/TypeScript sécurisée par App Attest avec Redis, extraction assistée par IA, tests automatisés et CI]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[MediaFlow]

    #summary[Logiciel desktop de traitement multimédia distribué sur le Microsoft Store : backend Rust\/Tauri 2 et interface Svelte 5\/TypeScript pour l'extraction, l'OCR, la transcription, la traduction et le traitement par lots avec FFmpeg, crédits IA, tests automatisés et CI multi-OS]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[Fractalium]

    #summary[Calcul distribué de fractales sur un cluster de machines : C++23 et MPI (Boost.MPI) en architecture maître\/travailleurs, interface Qt avec zoom interactif, précision de 100 décimales (Boost.Multiprecision), sauvegarde des sessions et reprise après plantage]

  ],
  [
  ],
)
