# Argon - Data warehouse Yelp

Projet d'informatique décisionnelle réalisé autour du dataset Yelp, avec l'objectif de transformer des données hétérogènes en support d'analyse exploitable.

## Périmètre

Le projet couvre la modélisation d'un data warehouse en étoile selon une approche Kimball, la préparation des données, leur chargement en base PostgreSQL et la création de tableaux de bord Metabase.

## Réalisation

- Conception du schéma décisionnel : tables de faits, dimensions et indicateurs.
- Mise en place d'un ETL Python/Pandas à partir de sources CSV, JSON et PostgreSQL.
- Nettoyage et normalisation des métadonnées avant chargement.
- Chargement PostgreSQL optimisé via `COPY` sur un volume d'environ 1,8 Go.
- Analyse de sentiment sur les avis Yelp avec des modèles Transformers.
- Visualisation des résultats dans Metabase.

## Stack

Python, Pandas, SQL, PostgreSQL, SQLite, Metabase, Transformers, PyTorch.
