// Import the rendercv function and all the refactored components
#import "@preview/rendercv:0.3.0": *

// Apply the rendercv template with custom configuration
#show: rendercv.with(
  name: "Rahman YILMAZ",
  title: "Rahman YILMAZ - CV",
  footer: context { [#emph[Rahman YILMAZ -- #str(here().page())\/#str(counter(page).final().first())]] },
  top-note: [ #emph[Dernière mise à jour Juin 2026] ],
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
    month: 6,
    day: 17,
  ),
)


= Rahman YILMAZ

  #headline([Développeur Android \/ Full Stack])

#connections(
  [#connection-with-icon("location-dot")[Chalon-sur-Saône, France]],
  [#link("mailto:contact@rahman.ovh", icon: false, if-underline: false, if-color: false)[#connection-with-icon("envelope")[contact\@rahman.ovh]]],
  [#link("tel:+33-7-81-38-88-82", icon: false, if-underline: false, if-color: false)[#connection-with-icon("phone")[07 81 38 88 82]]],
  [#link("https://sudo-rahman.fr/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("link")[sudo-rahman.fr]]],
  [#link("https://github.com/Sudo-Rahman", icon: false, if-underline: false, if-color: false)[#connection-with-icon("github")[Sudo-Rahman]]],
  [#link("https://www.linkedin.com/in/rahman-yilmaz-9236ab270/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("linkedin")[LinkedIn]]],
)


== Profil

Développeur Android \/ Full Stack, Bac+5 en informatique, avec deux ans d'expérience chez Sweepin sur des applications mobiles SmartCity et e-santé.

Passionné par l'informatique depuis jeune, j'aime comprendre comment les choses fonctionnent, apprendre de nouvelles technologies et progresser en continu. Curieux et autonome, je sais monter en compétence rapidement lorsqu'un projet demande d'explorer un nouvel outil, un nouveau framework ou un environnement technique différent.

== Compétences

#strong[Android:] Kotlin, Java, Jetpack Compose, Clean Architecture, Gradle

#strong[Web & backend:] Node.js, SvelteKit, TypeScript, PHP\/Symfony, APIs REST, PostgreSQL, MySQL, Prisma, Redis, Paddle, Stripe, webhooks

#strong[Tests & livraison:] Tests unitaires, tests d'intégration, CI\/CD, GitHub Actions, Docker, debugging, documentation

#strong[Logiciel & desktop:] Rust, Tauri 2, C++23, Qt 6, FFmpeg, rclone, CMake, Conan

#strong[Data, IA & automatisation:] Python, Pandas, SQL, OCR, transcription, traduction IA, pipelines LLM, BullMQ

#strong[Langues:] Français (natif), Turc (bilingue), Anglais B2

== Expérience

#regular-entry(
  [
    #strong[Solo Agilis Sweepin], Développeur Android & Full Stack

    - Maintenu la solution Android SmartCity : analyse d'anomalies, corrections, évolutions, création de modules et publication de versions

    - Intégré Jetpack Compose dans l'écosystème Android de Sweepin pour moderniser des interfaces mobiles et outils internes

    - Développé des fonctionnalités mobiles et web pour les solutions SmartCity et e-santé dans un contexte multi-clients

    - Connecté les écrans Android aux APIs REST, back-offices et services PHP\/Symfony

  ],
  [
    Dijon, France

    Sep 2023 – Sep 2025

  ],
)

#regular-entry(
  [
    #strong[Steerway], Développeur logiciel freelance

    - Développé une plateforme SaaS SvelteKit\/TypeScript avec authentification, dashboard client, PostgreSQL\/Prisma et gestion de licences

    - Intégré Paddle : abonnements, webhooks, synchronisation d'états, historique de transactions et tokens\/licences

    - Mis en place une architecture événementielle Redis + BullMQ + Resend pour les emails transactionnels et les rappels

    - Contribué à un pipeline documentaire : scraping multi-sources, normalisation Markdown, recherche hybride et contenus exploitables

  ],
  [
    Remote

    Nov 2025 – Jan 2026

  ],
)

#regular-entry(
  [
    #strong[Indépendant], Développeur & éditeur de logiciels

    - Conçu et commercialisé des logiciels destinés aux particuliers : architecture, développement, paiements Stripe (abonnements\/achats uniques), tests, packaging et maintenance

    - Développé des applications desktop, mobile et sites produit avec Tauri\/Rust, SvelteKit, SwiftUI ou Kotlin selon le besoin

    - Mis en place des tests unitaires, tests d'intégration, CI GitHub Actions, documentation et suivi des releases

    - Piloté l'acquisition produit : SEO technique, pages produit, tracking, Google Ads, Apple Ads et suivi des conversions

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
    #strong[MediaFlow]

    #summary[Application desktop locale : Tauri 2, Rust, Svelte 5, FFmpeg, OCR, transcription, traduction IA, tests unitaires Rust, tests d'intégration OCR\/merge et CI multi-OS]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[Iridium]

    #summary[Client desktop C++23\/Qt 6 pour rclone : gestion multi-cloud, exploration, recherche multi-remotes, synchronisation, progression temps réel, packaging multi-plateforme et releases GitHub]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[linkKeep]

    #summary[Application Apple native iOS\/iPadOS\/macOS : SwiftUI, Core Data\/CloudKit, synchronisation iCloud, architecture Domain\/Data\/Services, tests unitaires Swift et site multilingue]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[Kotlin Météo]

    #summary[Application Android native de prévisions météo : Kotlin, Open-Meteo, Geoapify, géolocalisation GPS, recherche de ville, prévisions 24 h\/10 jours et persistance locale]

  ],
  [
  ],
)
