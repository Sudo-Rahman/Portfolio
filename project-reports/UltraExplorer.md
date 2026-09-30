# Ultra Explorer | Fiche produit

![Explorateur double panneau d'Ultra Explorer](https://ultra-explorer.app/screenshots/hero-explorer.webp)

## En bref

- **Gestionnaire de fichiers multi-cloud** : une interface graphique moderne pour [rclone](https://rclone.org/), l'outil open source de référence pour manipuler plus de 40 stockages distants.
- **Deux modes de déploiement, un seul produit** : application desktop native (Tauri 2) ou application web auto-hébergée sur un serveur ou un NAS via Docker.
- **Cœur applicatif en Rust** partagé entre les deux modes, interface SvelteKit commune.
- **Produit commercialisé** : offre gratuite, abonnement Pro et licence à vie, avec site web, documentation, paiement Stripe et activation des licences par installation.
- **Version 1.0 publiée** en septembre 2026 (macOS disponible, Windows et Linux en préparation).
- **Code source privé** : cette fiche présente le produit et ses choix d'architecture, sans extraits de code.

## Liens publics

- **Site web** : [ultra-explorer.app](https://ultra-explorer.app/)
- **Documentation** : [ultra-explorer.app/docs](https://ultra-explorer.app/docs)
- **Tarifs** : [ultra-explorer.app/pricing](https://ultra-explorer.app/pricing)

## Objectif

rclone est extrêmement puissant mais s'utilise en ligne de commande : configurer un remote OAuth, comparer deux arborescences ou lancer une synchronisation miroir sans rien effacer par erreur demande de l'expérience. Ultra Explorer apporte à rclone l'interface qui lui manquait : un explorateur double panneau pour naviguer et transférer entre n'importe quels stockages (Google Drive, OneDrive, S3, Dropbox, Proton Drive, SFTP, SMB, WebDAV, disque local…), avec des garde-fous explicites sur toutes les opérations destructrices.

Le produit vise les utilisateurs qui manipulent de gros volumes répartis sur plusieurs clouds, ainsi que ceux qui veulent piloter leurs stockages depuis un NAS domestique, y compris depuis un téléphone.

Ultra Explorer est la troisième itération de mon travail autour de rclone, après la bibliothèque [rclone_cpp](/projects/rclone_cpp) et le client desktop C++/Qt [Iridium](/projects/Iridium). Il reprend le même besoin avec une architecture repensée pour être distribuée, maintenue et vendue.

## Fonctionnalités principales

### Stockages et connexions

- Catalogue revu de **39 fournisseurs directs** plus les types virtuels Alias, **Crypt** (chiffrement côté client) et **Combine** (réunion de plusieurs stockages).
- Formulaires générés à partir du schéma de fournisseurs de rclone, avec OAuth, test de connexion, édition, reconnexion et suppression.
- Gestion des dépendances entre stockages : un remote Crypt qui pointe vers un autre stockage ne peut pas être cassé silencieusement.
- Import de fichiers `rclone.conf` existants avec prévisualisation, et export chiffré.
- Tableau de bord : quotas, capacités de chaque stockage et état de santé.

![Tableau de bord des stockages](https://ultra-explorer.app/screenshots/storages-dashboard-light.webp)

### Explorateur double panneau

- Deux volets indépendants, chacun avec son historique de navigation, sa saisie de chemin, son tri et ses filtres.
- Multi-sélection, raccourcis clavier, menu contextuel, renommage, création de dossier, propriétés et calcul récursif de la taille des dossiers.
- Glisser-déposer entre les deux volets : local vers cloud, cloud vers local, ou directement d'un cloud à un autre.
- Tables virtualisées et caches de répertoires bornés, testés sur des dossiers de **50 000 entrées**.

### Transferts sans écrasement silencieux

- Un moteur de transferts **FIFO durable** unique pour toutes les copies et déplacements, avec au plus quatre opérations simultanées et des lots atomiques jusqu'à 200 éléments.
- Aucun fichier n'est jamais écrasé sans décision explicite : chaque conflit propose Écraser, Ignorer, Conserver les deux (lorsque c'est sûr) ou Annuler le lot entier.
- Progression en direct, annulation, relance et historique paginé dans un espace Transferts dédié.

![Espace Transferts](https://ultra-explorer.app/screenshots/transfers-workspace.webp)

### Synchronisations planifiées (Pro)

- Tâches nommées et persistantes en deux modes : **Mise à jour** (remplace les fichiers modifiés, conserve ceux présents uniquement à destination) et **Miroir exact**.
- Le mode miroir exige un **aperçu dry-run** récent pour la révision courante de la tâche et applique un **plafond de suppressions**.
- Filtres d'inclusion et d'exclusion et bornes de taille ; un élément exclu n'est jamais supprimé.
- Exécution manuelle ou planifiée (intervalle, quotidienne, hebdomadaire).

![Simulation dry-run avant synchronisation](https://ultra-explorer.app/screenshots/sync-dryrun.webp)

### Recherche et analyse d'espace (Pro)

- Recherche récursive simultanée sur plusieurs stockages, avec filtres par extension, taille, date et motif.
- Analyse d'espace sur un disque local ou un bucket distant, avec quatre visualisations : sunburst, treemap, circle pack et arbre, zoom hiérarchique et ouverture directe dans l'explorateur.

![Analyse d'espace en treemap](https://ultra-explorer.app/screenshots/space-analysis-treemap.webp)

### Version web et mobile

- L'édition Docker expose la même interface via le navigateur, derrière une authentification administrateur.
- Installable comme application web (PWA) sur téléphone ; sur iPhone, les fichiers téléchargés peuvent être enregistrés via la feuille de partage native.
- Interface disponible en **dix langues**, avec changement de langue instantané sans rechargement.

## Architecture

```text
      Interface SvelteKit partagée
                 │
       ┌─────────┴──────────┐
   IPC Tauri 2          HTTP + SSE (Axum)
   (desktop)            (Docker / NAS)
       └─────────┬──────────┘
         Cœur applicatif Rust
       ┌─────────┴──────────┐
  Adaptateur rclone     Persistance SQLite
```

- **Un seul cœur, deux transports.** Toute la logique métier (validation, orchestration, états des transferts, événements) vit dans un cœur Rust commun. L'application Tauri et le serveur Axum ne sont que des adaptateurs minces, ce qui empêche le desktop et le web de diverger.
- **Contrats typés de bout en bout.** Les objets échangés sont définis en Rust puis générés automatiquement en TypeScript : l'interface n'a aucune connaissance de l'API interne de rclone et le compilateur détecte toute rupture de contrat.
- **rclone comme moteur embarqué.** rclone est piloté via son API de contrôle distant, livré en sidecar vérifié par empreinte SHA-256, à partir d'un fork maintenu qui ajoute un correctif d'annulation des parcours d'arborescence.
- **Secrets hors de l'interface.** Les identifiants restent dans la configuration privée de rclone et ne sont jamais envoyés au frontend.
- **Conteneur durci.** L'image Docker s'exécute sans privilèges, avec capacités Linux retirées et système de fichiers racine en lecture seule.

## Commercialisation

Ultra Explorer est distribué avec une offre gratuite (explorateur, stockages et transferts sans limite) et des offres Pro mensuelle, annuelle ou à vie qui débloquent la recherche, l'analyse d'espace et les synchronisations.

J'ai développé l'ensemble de la chaîne commerciale dans un second projet, le site ultra-explorer.app :

- **Site vitrine et documentation** en SvelteKit, multilingue, avec pages d'intégration par fournisseur, comparatifs et tutoriels.
- **Backend Convex** avec authentification Better Auth, paiement et abonnements **Stripe**, espace compte et gestion des installations.
- **Licences par installation** : l'application s'active depuis le navigateur en confirmant un code, puis conserve un reçu signé **Ed25519** vérifié localement, ce qui permet un usage hors connexion sans jamais stocker de session de compte dans l'application.

## Qualité et outillage

- Plus de **1 300 tests Rust** et environ 200 fichiers de tests côté interface.
- Intégration continue multi-OS (macOS, Windows, Linux) avec build de l'application desktop et test de fumée de l'image Docker.
- Builds desktop signés et mises à jour signées, profils de distribution par plateforme.
- Audit automatisé des traductions (parité des catalogues, placeholders ICU, détection de textes non traduits).

## Ce que le projet démontre

- Conception d'une architecture hexagonale en Rust partagée entre une application desktop et un service web.
- Maîtrise de la chaîne Tauri 2 / SvelteKit / Axum, de la programmation asynchrone avec Tokio et de l'intégration d'un outil tiers complexe comme rclone.
- Attention portée à la sûreté des données : aucune opération destructrice sans confirmation, aperçus obligatoires, plafonds de suppression.
- Capacité à mener un produit jusqu'à la vente : site, documentation, tarification, paiement, licences, distribution et support.
