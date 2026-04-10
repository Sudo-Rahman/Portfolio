// Import the rendercv function and all the refactored components
#import "@preview/rendercv:0.3.0": *

// Apply the rendercv template with custom configuration
#show: rendercv.with(
  name: "Rahman YILMAZ",
  title: "Rahman YILMAZ - CV",
  footer: context { [#emph[Rahman YILMAZ -- #str(here().page())\/#str(counter(page).final().first())]] },
  top-note: [ #emph[Dernière mise à jour Avr 2026] ],
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
  typography-alignment: "justified",
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
  entries-degree-width: 1.7cm,
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
    month: 4,
    day: 10,
  ),
)


= Rahman YILMAZ

  #headline([Developpeur Full Stack, Mobile])

#connections(
  [#connection-with-icon("location-dot")[Chalon-sur-Saone, France]],
  [#link("mailto:contact@rahman.ovh", icon: false, if-underline: false, if-color: false)[#connection-with-icon("envelope")[contact\@rahman.ovh]]],
  [#link("tel:+33-7-81-38-88-82", icon: false, if-underline: false, if-color: false)[#connection-with-icon("phone")[07 81 38 88 82]]],
  [#link("https://sudo-rahman.fr/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("link")[sudo-rahman.fr]]],
  [#link("https://github.com/Sudo-Rahman", icon: false, if-underline: false, if-color: false)[#connection-with-icon("github")[Sudo-Rahman]]],
)


== Profile

Developpeur full stack et mobile diplome d'un Master 2 en Bases de Donnees et Intelligence Artificielle. 2 ans d'alternance chez Sweepin puis deux missions freelance pour une startup IA, autour d'un SaaS et de pipelines d'indexation pour LLM. J'aime concevoir des produits de bout en bout, de l'interface a l'infrastructure, avec autonomie et exigence technique.

== Experience

#regular-entry(
  [
    #strong[Solo Agilis Sweepin], Developpeur Full Stack et mobile (Alternance)

    - Developpement d'applications mobiles et web pour les solutions SmartCity et e-sante de Sweepin, dans un contexte multi-clients et multi-produits

    - Mainteneur principal de la solution Android SmartCity : evolution du socle, correction de bugs, ajout de fonctionnalites, creation de modules et publication des versions

    - Integration de Jetpack Compose dans l'ecosysteme Android de Sweepin et contribution a la modernisation des interfaces et outils internes

    - Elargissement progressif vers un role full stack avec contributions Android, frontend web et backend PHP\/Symfony sur les applications, APIs et back-offices

  ],
  [
    Dijon, France

    Sep 2023 – Sep 2025

    

    2 ans 1 mois

  ],
)

#regular-entry(
  [
    #strong[Steerway], Developpeur Full Stack (Freelance)

    - Conception et livraison d'une plateforme SaaS monorepo en SvelteKit 5\/TypeScript avec authentification, dashboard client, PostgreSQL\/Prisma et logique de licences

    - Integration du paiement par abonnement, des webhooks et de la synchronisation des etats d'abonnement, avec historique de transactions et gestion de tokens\/licences

    - Mise en place d'une architecture evenementielle Redis + BullMQ + Resend pour les emails transactionnels et l'automatisation des rappels

    - Contribution a un pipeline RAG\/LLM de bout en bout : scraping multi-sources (sites, documentations, depots Git, llms.txt), normalisation en Markdown, indexation hybride FAISS\/BM25, embeddings, reranking et preparation de datasets pour l'evaluation et l'entrainement

  ],
  [
    Remote

    Nov 2025 – Jan 2026

    

    3 mois

  ],
)

== Education

#education-entry(
  [
    #strong[Universite de Bourgogne Europe], Informatique - Bases de Donnees et Intelligence Artificielle

  ],
  [
    Dijon, France

    Sep 2024 – Sep 2025

  ],
  degree-column: [
    #strong[Master 2]
  ],
)

#education-entry(
  [
    #strong[Universite de Bourgogne], Informatique - Bases de Donnees et Intelligence Artificielle

  ],
  [
    Dijon, France

    Sep 2023 – Juin 2024

  ],
  degree-column: [
    #strong[Master 1]
  ],
)

#education-entry(
  [
    #strong[Universite de Bourgogne], Informatique

  ],
  [
    Dijon, France

    Sep 2022 – Juin 2023

  ],
  degree-column: [
    #strong[Licence 3]
  ],
)

#education-entry(
  [
    #strong[Universite de Bourgogne], Sciences et techniques

  ],
  [
    Dijon, France

    Sep 2020 – Juin 2022

  ],
  degree-column: [
    #strong[DEUG]
  ],
)

#education-entry(
  [
    #strong[Lycee prive catholique], Serie S

  ],
  [
    Chalon-sur-Saone, France

    Sep 2018 – Juin 2020

  ],
  degree-column: [
    #strong[Baccalaureat]
  ],
)

== Projects

#regular-entry(
  [
    #strong[#link("https://github.com/Sudo-Rahman/MediaFlow")[MediaFlow]]

    #summary[Boite a outils multimedia locale en Tauri 2 (Rust + Svelte 5) regroupant extraction de pistes, merge, OCR video, transcription, traduction IA multi-modeles et renommage en masse, avec pipeline FFmpeg, traitement natif et interface desktop multi-plateforme]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[#link("https://github.com/Sudo-Rahman/Iridium")[Iridium]]

    #summary[Client desktop C++23\/Qt 6 : centralise plus de 40 types de stockage cloud via rclone, avec exploration, recherche multi-remotes, synchronisation et suivi de progression en temps reel]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[#link("https://github.com/Sudo-Rahman/linkKeep")[linkKeep]]

    #summary[Application Apple native iOS\/iPadOS\/macOS : organisation de signets avec SwiftUI, Core Data\/CloudKit, synchronisation iCloud, sante des liens, verrouillage biometrique et site web multilingue SvelteKit]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[#link("https://github.com/Sudo-Rahman/renamer")[renamer]]

    #summary[Application desktop multiplateforme Tauri 2 : renommage de lots de fichiers avec formatters combinables, apercu temps reel, API Rust\/Axum, licences Stripe et auto-update]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[#link("https://github.com/Sudo-Rahman/Fractalium")[Fractalium]]

    #summary[Application C++\/Qt de calcul distribue de fractales via MPI : zoom interactif, precision 100 decimales, snapshots de session et execution sur cluster]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[#link("https://github.com/Sudo-Rahman/Lichess-Data")[Lichess-Data]]

    #summary[Serveur Java multi-clients : indexe et interroge des PGN Lichess de plus de 100 Go, avec recherche, statistiques et PageRank]

  ],
  [
  ],
)

== Skills

#strong[Langages:] Kotlin, Swift, Rust, C\/C++ (17\/20\/23), TypeScript, Python, Java, PHP

#strong[Web & Frontend:] SvelteKit, Svelte 5, Tailwind CSS, HTML\/CSS

#strong[Mobile & Apple:] Android (Jetpack Compose, MVVM, SDK), iOS\/macOS (SwiftUI), Kotlin Multiplatform

#strong[Backend & Data:] Symfony, Node.js, Axum, API REST, Prisma, PostgreSQL, MariaDB, MongoDB, Redis, Neo4j

#strong[Desktop & Systeme:] Tauri 2, Qt 5\/6, Iced, MPI, sockets TCP, rclone

#strong[Outils IA:] Opencode, Codex

#strong[DevOps & Outils:] Docker, GitHub Actions, Git, CMake, Conan 2, Gradle, pnpm, uv

#strong[Langues:] Francais (natif), Turc (bilingue), Anglais (intermédiaire B1)
