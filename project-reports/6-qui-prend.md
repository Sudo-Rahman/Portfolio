# 6-qui-prend

Une version en réseau du jeu de cartes *6 qui prend !*, écrite en C pour le module Systèmes et Réseaux de la Licence 3 Informatique. Jusqu'à dix joueurs se connectent à un serveur depuis leur terminal, et on peut compléter la table avec des bots.

## En bref

- **Contexte** : projet universitaire, L3 Informatique, fin 2022.
- **Stack** : C, sockets TCP, threads POSIX, signaux UNIX, Linux.

## Liens

- [Code source](https://github.com/Sudo-Rahman/6-qui-prend)

## Le sujet

L'objectif du module était de pratiquer la programmation réseau et système : sockets, threads, processus, signaux, gestion de la mémoire à la main. Le *6 qui prend !* s'y prête bien : chaque tour, tous les joueurs choisissent une carte en même temps, puis le serveur les résout dans l'ordre.

## Ce que fait le programme

- Partie de 2 à 10 joueurs en réseau, avec un salon où chacun choisit un pseudo et se déclare prêt.
- Ajout de bots à la volée depuis le serveur.
- Règles réglables avant chaque partie : nombre maximal de têtes de bœuf et nombre de manches.
- Parties enchaînées avec les mêmes joueurs, statistiques de fin (moyenne des têtes, meilleur et pire joueur, durée).
- Affichage coloré dans le terminal et journal horodaté de chaque partie dans un dossier `LOG/`.

## Comment c'est construit

Le serveur garde tout l'état du jeu : plateau, mains, scores. Les clients ne font qu'envoyer leurs choix et afficher ce qu'ils reçoivent.

- **Un thread par joueur** : pendant un tour, le serveur attend les choix de tous les joueurs en parallèle, puis les synchronise avant de poser les cartes dans l'ordre croissant.
- **Les bots sont de vrais clients** : le serveur les lance avec `fork` et `execv`, et ils se connectent par le même protocole qu'un humain. Ils jouent une carte au hasard parmi les coups valides.
- **Arrêt propre** : `SIGINT` et `SIGTERM` sont interceptés pour fermer les sockets, écrire le journal et libérer la mémoire.
- **TCP plutôt qu'UDP** : dans un jeu au tour par tour, perdre un choix de carte casserait la partie.

Le code est documenté avec Doxygen.

## Limites

- Pas de tests automatisés : le jeu a été validé en lançant plusieurs clients à la main.
- Quelques allocations ne sont pas libérées dans la boucle de jeu.
- Les bots s'identifient en envoyant un nombre particulier comme pseudo : simple, mais fragile.

## Ce que le projet montre

- Les bases de la programmation réseau en C : `socket`, `bind`, `accept`, `send`, `recv`.
- La synchronisation de plusieurs threads et la gestion de processus fils.
- Un programme système qui s'arrête proprement.
