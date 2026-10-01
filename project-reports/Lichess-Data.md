# Lichess-Data

Un serveur Java qui indexe les parties d'échecs publiées par Lichess, des fichiers PGN qui peuvent dépasser 100 Go, et permet à plusieurs clients de les interroger en même temps : parties d'un joueur, ouvertures les plus jouées, joueurs les plus actifs, et même un classement par PageRank. Projet réalisé pour un cours de Licence, avec Maxime Colliat sur une partie du code.

## En bref

- **Contexte** : projet universitaire (module INFO-4B), 2022.
- **Stack** : Java 17, sockets TCP, threads, sérialisation Java.
- **Données** : la base publique [database.lichess.org](https://database.lichess.org/).

## Liens

- [Code source](https://github.com/Sudo-Rahman/Lichess-Data)

## Le problème

Un mois de parties Lichess représente des dizaines de millions de parties. Impossible de tout charger en mémoire sous forme d'objets : il faut trouver les parties utiles sans relire tout le fichier à chaque question.

## Ce que fait le programme

Un client connecté au serveur peut :

- rechercher des parties par premier coup, par Elo ou par date, et les rejouer coup par coup ;
- retrouver toutes les parties d'un joueur ;
- afficher les cinq ouvertures les plus jouées, et les parties terminées en exactement *n* coups ;
- lister les joueurs les plus actifs du mois, et semaine par semaine ;
- calculer le joueur le plus fort au sens du PageRank ;
- trouver la plus longue suite de coups commune à plusieurs parties.

Les recherches peuvent être affinées : on repart du résultat précédent pour filtrer encore.

## Comment c'est construit

- **Indexer des positions plutôt que charger des parties** : le serveur ne garde en mémoire que des tables qui associent un joueur, un Elo, une date, une ouverture ou un nombre de coups à la position (en octets) des parties dans le fichier. Pour afficher une partie, il va la lire directement à cet endroit.
- **Indexation en parallèle** : le fichier est découpé en autant de tranches que de cœurs, chaque thread indexe sa tranche dans des `ConcurrentHashMap`.
- **Index sauvegardés sur disque** : la première indexation peut être longue, alors les tables sont sérialisées dans un fichier `.hashmap` et rechargées au démarrage suivant. Les recherches affinées créent aussi leur propre index.
- **Plusieurs clients à la fois** : chaque connexion est un thread, et le nombre de clients et de requêtes simultanées est limité en fonction du nombre de cœurs.
- **PageRank appliqué aux échecs** : chaque joueur est un nœud, et chaque défaite crée un lien du perdant vers le gagnant. Battre un joueur fort rapporte donc plus que battre un débutant.

## Limites

- Pas de tests automatisés.
- Le protocole repose sur la sérialisation Java, simple mais lié à Java des deux côtés.

## Ce que le projet montre

- Le traitement de fichiers de plusieurs dizaines de gigaoctets avec une mémoire limitée.
- La programmation concurrente en Java : threads, structures concurrentes, limitation des accès.
- L'adaptation d'un algorithme classique (PageRank) à un problème concret.
