# Leafium

Leafium modélise l'activité de cinémas dans une base MongoDB (films, salles, séances, tickets vendus) et en tire des statistiques sous forme de graphiques. Projet réalisé pour un cours de bases de données NoSQL en Master.

## En bref

- **Contexte** : projet universitaire, Master 1 Informatique, 2024.
- **Stack** : Python, MongoDB 6 (Docker), PyMongo, Matplotlib.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Leafium)

## Le sujet

Concevoir une base orientée documents pour un ensemble de cinémas, la remplir avec des données réalistes, puis l'interroger pour répondre à des questions d'exploitation : quels films marchent, quels cinémas vendent le plus, quelles notes reçoivent les films.

## Ce que fait le projet

- Création des collections avec validation de schéma, puis génération d'un jeu de données : films aléatoires et vrais cinémas de Paris et Dijon, avec leurs salles et des séances fictives.
- Des requêtes d'analyse : note moyenne par film, films par catégorie ou par réalisateur, tickets vendus par film et par cinéma, films sous un prix donné.
- Des graphiques pour chaque analyse : barres pour les classements, camemberts pour les parts de marché.
- Un document de 18 requêtes MongoDB commentées, du simple `find` aux agrégations en plusieurs étapes.

![Graphique généré par Leafium](https://raw.githubusercontent.com/Sudo-Rahman/Leafium/main/documentation/img/Figure_1.png)

## Comment c'est construit

- **Deux collections** : `films`, avec ses réalisateurs, catégories et commentaires, et `cinemas`, avec l'adresse, les salles, et dans chaque salle les séances. Une séance ne recopie pas le film entier : elle garde seulement son identifiant et son nom.
- **Validation côté serveur** : MongoDB n'impose pas de schéma par défaut, mais ici chaque collection a un `$jsonSchema` qui fixe les types et les champs obligatoires, y compris dans les documents imbriqués.
- **Pipelines d'agrégation** (`$unwind`, `$group`, `$project`, `$sort`) plutôt que MapReduce, plus lisible et plus rapide dans les versions récentes.
- **Données cohérentes** : durées entre 60 et 160 minutes, prix entre 5 et 15 €, tickets vendus jamais supérieurs à la capacité de la salle.
- **MongoDB dans Docker** avec un volume nommé, pour que tout le monde travaille sur le même environnement.

## Limites

Pas de tests automatisés : les résultats se vérifient en lançant le script principal.

## Ce que le projet montre

- La modélisation d'un domaine en base orientée documents, avec ses compromis entre imbrication et références.
- L'écriture de requêtes d'agrégation MongoDB et leur visualisation en Python.
