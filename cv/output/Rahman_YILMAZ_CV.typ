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
    day: 2,
  ),
)


= Rahman YILMAZ

  #headline([Ingénieur logiciel full stack - Data & IA])

#connections(
  [#connection-with-icon("location-dot")[Chalon-sur-Saône, France]],
  [#link("mailto:contact@rahman.ovh", icon: false, if-underline: false, if-color: false)[#connection-with-icon("envelope")[contact\@rahman.ovh]]],
  [#link("tel:+33-7-81-38-88-82", icon: false, if-underline: false, if-color: false)[#connection-with-icon("phone")[07 81 38 88 82]]],
  [#link("https://sudo-rahman.fr/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("link")[sudo-rahman.fr]]],
  [#link("https://github.com/Sudo-Rahman", icon: false, if-underline: false, if-color: false)[#connection-with-icon("github")[Sudo-Rahman]]],
)


== Profil

Ingénieur logiciel Bac+5 en Bases de Données et Intelligence Artificielle, basé à Chalon-sur-Saône. Deux ans d'alternance chez Sweepin sur des applications mobiles et web multi-clients, avec maintenance corrective\/évolutive, analyse d'anomalies, publication de versions, APIs, back-offices et bases de données. Missions freelance autour d'un SaaS et de pipelines IA. J'aime concevoir des produits utiles de bout en bout, de l'interface à la donnée, avec autonomie et exigence technique.

== Points forts

- Applications métier : mobile\/web, APIs, back-offices, dashboards et amélioration d'outils existants

- Maintenance applicative : analyse d'anomalies, corrections, évolutions et publication de versions

- Data & BI : SQL\/PostgreSQL, ETL Python\/Pandas, data warehouse, qualité de données et tableaux de bord

- IA appliquée : pipelines LLM, transcription\/traduction IA, analyse de texte, analyse de sentiment et préparation de datasets

== Expérience

#regular-entry(
  [
    #strong[Solo Agilis Sweepin], Développeur Full Stack et mobile (Alternance)

    - Développement d'applications métier mobiles et web pour les solutions SmartCity et e-santé de Sweepin, dans un contexte multi-clients et multi-produits

    - Mainteneur principal de la solution Android SmartCity : analyse d'anomalies, maintenance corrective\/évolutive, ajout de fonctionnalités, création de modules et publication de versions

    - Intégration de Jetpack Compose dans l'écosystème Android de Sweepin et contribution à la modernisation des interfaces et outils internes

    - Élargissement progressif vers un rôle full stack avec contributions Android, frontend web et backend PHP\/Symfony sur les applications, APIs, back-offices et besoins produit

  ],
  [
    Dijon, France

    Sep 2023 – Sep 2025

  ],
)

#regular-entry(
  [
    #strong[Steerway], Développeur Full Stack (Freelance)

    - Conception et livraison d'une plateforme SaaS monorepo en SvelteKit 5\/TypeScript avec authentification, dashboard client, PostgreSQL\/Prisma et logique de licences

    - Intégration du paiement par abonnement, des webhooks et de la synchronisation des états d'abonnement, avec historique de transactions et gestion de tokens\/licences

    - Mise en place d'une architecture événementielle Redis + BullMQ + Resend pour les emails transactionnels et l'automatisation des rappels

    - Contribution à un pipeline LLM de bout en bout : scraping multi-sources, normalisation en Markdown, préparation de textes et de datasets d'évaluation

  ],
  [
    Remote

    Nov 2025 – Jan 2026

  ],
)

== Formation

#education-entry(
  [
    #strong[Université de Bourgogne \/ Université de Bourgogne Europe], Informatique - Bases de Données et Intelligence Artificielle

    - Parcours orienté bases de données, intelligence artificielle, systèmes d'information et exploitation de données

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
    #strong[Argon - Data warehouse Yelp]

    #summary[Projet d'informatique décisionnelle : data warehouse Kimball en étoile, ETL Python\/Pandas sur données CSV, JSON et PostgreSQL (\~1,8 Go), nettoyage de métadonnées, chargement PostgreSQL via COPY, analyse de sentiment sur \~9 M de commentaires et tableaux de bord Metabase]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[MediaFlow]

    #summary[Boîte à outils multimédia locale en Tauri 2 (Rust + Svelte 5) regroupant extraction de pistes, OCR vidéo, transcription, traduction IA multi-modèles et renommage en masse, avec pipeline FFmpeg et interface desktop multi-plateforme]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[Iridium]

    #summary[Client desktop C++23\/Qt 6 : centralise plusieurs types de stockage cloud via rclone, avec exploration, recherche multi-remotes, synchronisation et suivi de progression en temps réel]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[Fractalium]

    #summary[Application C++\/Qt de calcul distribué via MPI : zoom interactif, précision 100 décimales, snapshots de session et exécution sur cluster]

  ],
  [
  ],
)

#regular-entry(
  [
    #strong[Lichess-Data]

    #summary[Serveur Java multi-clients : indexe et interroge plus de 100 Go de parties PGN, avec recherche, statistiques et PageRank]

  ],
  [
  ],
)

== Compétences

#strong[Support & applications métier:] Maintenance corrective\/évolutive, analyse d'anomalies, documentation, publication de versions, back-offices

#strong[Backend & Data:] Symfony, Node.js, Axum, API REST, Prisma, PostgreSQL, MariaDB, MongoDB, Redis, Neo4j

#strong[Data & BI:] SQL, PostgreSQL, ETL Python\/Pandas, data warehouse, Metabase, nettoyage de métadonnées

#strong[IA appliquée:] Pipelines LLM, transcription\/traduction IA, analyse de texte, analyse de sentiment, préparation de datasets

#strong[Langages & outils:] TypeScript, Kotlin, Python, PHP, Java, Rust, C\/C++, Git, Docker, GitHub Actions

#strong[Desktop & Système:] Tauri 2, Qt 5\/6, Iced, MPI, sockets TCP, rclone

#strong[Langues:] Français (natif), Turc (bilingue), Anglais B1 (documentation technique, échanges écrits simples)
