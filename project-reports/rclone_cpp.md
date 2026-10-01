# rclone_cpp

rclone_cpp est une bibliothèque C++ pour piloter [rclone](https://rclone.org/) depuis un programme : lister des fichiers, copier, synchroniser, lire la configuration, le tout avec des objets C++ typés au lieu de texte à analyser. Je l'ai écrite pour [Iridium](/projects/Iridium), mon client cloud en Qt, puis publiée séparément.

## En bref

- **Contexte** : bibliothèque open source, 2024.
- **Stack** : C++17/23, Boost (Process, JSON, Signals2, Thread), CMake, Conan 2.
- **Distribution** : paquet Conan, version 0.6.2.

## Liens

- [Code source](https://github.com/Sudo-Rahman/rclone_cpp)

## Le besoin

rclone sait parler à plus de 70 services de stockage, mais il s'utilise en ligne de commande. Depuis du C++, il faut lancer le binaire, lire sa sortie ligne par ligne, la convertir en données utilisables, gérer les erreurs et pouvoir annuler. rclone_cpp fait tout ça une fois pour toutes.

## Ce que fait la bibliothèque

- Une méthode C++ par commande rclone : `lsjson`, `copyto`, `moveto`, `sync`, `bisync`, `mkdir`, `delete`, `about`, `size`, `check`, `tree`…
- Des sorties converties en objets : fichiers, stockages, version, espace disponible, journaux JSON.
- Des options typées pour les filtres (`--include`, `--max-depth`), les performances (`--transfers`, `--checkers`) et les journaux.
- Des événements pour suivre une commande : démarrage, chaque ligne de sortie, fin, arrêt.
- Une file d'exécution avec priorités pour lancer plusieurs commandes en parallèle sans saturer la machine.

## Comment c'est construit

- **rclone en sous-processus** plutôt qu'une liaison avec son code Go : pas de compilation croisée compliquée, et on peut mettre rclone à jour sans recompiler la bibliothèque.
- **Une API chaînable** : `p.lsjson(dossier).execute().wait_for_finish()`.
- **Lecture en continu** : la sortie standard et la sortie d'erreur sont lues sur des threads séparés, et chaque ligne est transmise à l'analyseur dès qu'elle arrive.
- **Extensible** : entités, analyseurs et options sont des classes de base qu'on peut dériver. Les concepts C++20 vérifient à la compilation qu'on passe les bons types.
- **Implémentation cachée** (Pimpl) : les détails des processus et des threads restent dans les fichiers `.cpp`, ce qui garde les en-têtes légers.

## Qualité

- Tests Boost.Test sur les entités, les analyseurs, les processus et la file d'exécution.
- Compilation et tests dans GitHub Actions.

## Ce que le projet montre

- La conception d'une bibliothèque C++ réutilisable, avec une API pensée pour ceux qui l'utilisent.
- La gestion de processus externes et de threads en C++ moderne.
- Un morceau d'Iridium rendu réutilisable par d'autres projets.
