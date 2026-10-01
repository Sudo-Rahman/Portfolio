# Titanium

Titanium est un carnet de contacts pour ordinateur, écrit en C++ avec Qt pour un projet de Licence 3. Chaque contact garde l'historique des échanges avec lui, et les lignes marquées `@todo` dans une note deviennent automatiquement des tâches datées.

## En bref

- **Contexte** : projet universitaire, Licence 3 Informatique, 2022.
- **Stack** : C++17, Qt 5/6 (Widgets, SQL), SQLite, CMake ou qmake.
- **Licence** : LGPL v3.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Titanium)

## Ce que fait l'application

- Créer, modifier et supprimer des contacts : nom, entreprise, e-mail, téléphone, photo.
- Ajouter à chaque contact des interactions (notes libres sur un appel, une réunion…).
- Transformer les lignes `@todo` d'une interaction en tâches, avec une date fixée par `@date jj/mm/aaaa`.
- Afficher toutes les tâches de tous les contacts, triées par date, en masquant celles qui sont passées.
- Rechercher un contact sur tous les champs, ou par attribut et plage de dates, et trier par nom ou date.
- Exporter et importer l'ensemble en JSON, avec détection des doublons.
- Garder un historique de toutes les modifications.

## Comment c'est construit

- **SQLite via QtSql** : la base est créée au premier lancement, à côté de l'exécutable.
- **Le métier séparé de Qt** : les classes métier utilisent les types standard du C++ ; des classes miroirs en types Qt servent à l'affichage, et une classe utilitaire convertit des unes aux autres.
- **Des identifiants horodatés** : chaque contact et chaque interaction a pour clé le moment de sa création, en microsecondes.
- **Signaux et slots Qt** pour relier la barre d'outils, les menus, la liste de contacts et le panneau de détail.
- **Deux systèmes de build** : un projet qmake pour Qt Creator et un `CMakeLists.txt`, avec les réglages propres à macOS, Windows et Linux.

Le code est documenté avec Doxygen, avec des diagrammes de classes et de cas d'utilisation.

## Limites

- Pas de tests automatisés.
- Beaucoup de pointeurs bruts et de `delete` manuels ; aujourd'hui j'utiliserais des pointeurs intelligents.

## Ce que le projet montre

- Une application de bureau complète en C++ et Qt : base de données, formulaires, recherche, import et export.
- Mes premiers pas sur des projets C++ structurés, avant Iridium et Fractalium.
