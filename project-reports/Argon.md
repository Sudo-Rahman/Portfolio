# Argon

Argon est un entrepôt de données construit à partir du jeu de données public de Yelp : commerces, avis, conseils et passages des clients. Les données sont nettoyées, chargées dans un modèle en étoile sous PostgreSQL, puis analysées dans des tableaux de bord Metabase. Projet d'informatique décisionnelle réalisé avec Maxime Colliat pendant le Master BDIA.

## En bref

- **Contexte** : projet d'informatique décisionnelle, Master 2 BDIA, 2024-2025.
- **Stack** : Python, Pandas, SQLite, PostgreSQL, Metabase, Transformers.
- **Volume** : environ 1,8 Go de données chargées.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Argon)

## Le sujet

Le jeu de données Yelp mélange des fichiers CSV, du JSON et des données issues d'une base PostgreSQL. L'objectif était de les rassembler dans un entrepôt pensé pour l'analyse, puis de répondre à des questions concrètes : quels commerces sont les mieux notés, où, à quelles heures ils sont fréquentés, comment évoluent les avis.

## Comment c'est construit

1. **Extraction** : des scripts Python lisent chaque source (commerces, avis, conseils, passages) et les déposent dans une base SQLite de travail.
2. **Analyse de sentiment** : les textes d'avis passent dans un modèle Transformers qui attribue un sentiment à chacun.
3. **Nettoyage** : normalisation des catégories, des attributs et des horaires, suppression des incohérences.
4. **Modélisation** : un schéma en étoile à la Kimball, avec des tables de faits, des dimensions et des magasins de données thématiques.
5. **Chargement** dans PostgreSQL avec `COPY`, bien plus rapide que des insertions ligne par ligne sur ce volume.
6. **Tableaux de bord** Metabase par thème : attributs, catégories, commerces, géographie, horaires, tendances et analyse de sentiment.

Les schémas (modèle initial, ETL, modèle de Kimball, chargement) sont fournis en diagrammes dans le dépôt, et un script `run.sh` enchaîne toutes les étapes.

## Ce que le projet montre

- La conception d'un entrepôt de données en étoile, de la source au tableau de bord.
- Un ETL Python capable de traiter plusieurs gigaoctets de données hétérogènes.
- L'ajout d'une analyse de texte par modèle de langue dans une chaîne décisionnelle.
