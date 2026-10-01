# PrimeShield

![Interface de PrimeShield](https://raw.githubusercontent.com/Sudo-Rahman/PrimeShield/master/assets/app1.png)

PrimeShield montre le fonctionnement de RSA à travers un échange entre Alice et Bob : génération des clés, chiffrement, déchiffrement, et ce qui se passe quand le message est altéré en route. Toutes les opérations mathématiques sont écrites à la main, sans bibliothèque de cryptographie. Projet réalisé avec Maxime Colliat.

## En bref

- **Contexte** : projet de cryptographie, début 2025.
- **Stack** : Rust, Iced (interface native), Tokio, Rayon.
- **Équipe** : 2 personnes.

## Liens

- [Code source](https://github.com/Sudo-Rahman/PrimeShield)

## Le but

On utilise RSA tous les jours sans voir ce qu'il y a dedans. Le projet réimplémente chaque brique (nombres premiers, exponentiation modulaire, inverse modulaire) et les rend visibles dans une interface à trois panneaux : Alice, Bob, et les informations publiques.

## Ce que fait l'application

- Générer deux nombres premiers, calculer *n* et φ(*n*), choisir un exposant public *e* et calculer la clé privée *d*.
- Chiffrer un message côté Alice, le déchiffrer côté Bob.
- Altérer le message chiffré avec le bouton « Fake it » et constater que le déchiffrement donne n'importe quoi.

## Comment c'est construit

- **Exponentiation modulaire rapide** par mise au carré successive, en O(log *x*).
- **Test de primalité de Fermat** sur les bases 2, 3, 5 et 7, et génération de nombres premiers en parallèle sur tous les cœurs avec Rayon.
- **Inverse modulaire** avec l'algorithme d'Euclide étendu. Une version par force brute est gardée dans le code pour comparer les deux approches.
- **Des entiers natifs** : `u64` pour les nombres premiers et `u128` pour les produits, ce qui évite une bibliothèque de grands entiers au prix de clés de petite taille.
- **Une interface qui ne se fige pas** : les calculs longs tournent dans des tâches Tokio séparées, et l'interface Iced suit l'architecture Elm (messages, mise à jour, vue).

## Qualité

- Huit tests sur les primitives : PGCD, exponentiation, primalité, génération de premiers, inverse modulaire.
- Tests lancés à chaque push par GitHub Actions, et builds de release pour six cibles (macOS, Windows et Linux, en Intel et ARM).

## Limites

Les clés tiennent dans 128 bits : c'est parfait pour comprendre RSA, mais sans aucune valeur de sécurité réelle.

## Ce que le projet montre

- Les mathématiques de RSA, implémentées et testées.
- Une application Rust native avec du calcul parallèle et une interface réactive.
