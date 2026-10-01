# Cadmium (Projet-CWA)

Cadmium est une application web de gestion de tâches écrite en Angular, réalisée à six pour le cours de Conception Web Avancée. Pas de bibliothèque de composants : toute l'interface est faite à la main avec Tailwind CSS.

## En bref

- **Contexte** : projet universitaire, Master 1 Informatique, 2024.
- **Stack** : Angular 16, TypeScript strict, Tailwind CSS, RxJS, GitHub Actions.
- **Équipe** : 6 personnes.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Projet-CWA)

## Le sujet

Le cours évaluait la maîtrise de TypeScript et d'Angular à travers une application de tâches : créer, afficher, modifier, supprimer, filtrer, trier. L'équipe a choisi de ne pas utiliser Angular Material ou PrimeNG pour construire elle-même chaque composant.

## Ce que fait l'application

- Créer une tâche avec nom, description, priorité, date d'échéance et couleur, avec validation des champs.
- Afficher les tâches en cartes, avec une bordure qui va du bleu au rouge selon la priorité.
- Voir, modifier et supprimer une tâche dans une fenêtre modale, avec confirmation avant suppression.
- Supprimer aussi en glissant une carte vers une zone de dépôt.
- Filtrer par statut et par priorité, trier par échéance ou par priorité, et paginer par 12 avec une animation de glissement.

## Comment c'est construit

- **Les données restent dans le navigateur** (`localStorage`), derrière un service qui joue le rôle de dépôt : on pourrait le remplacer par une API sans toucher aux composants.
- **Des composants qui s'emboîtent** : la page d'accueil charge les tâches, un composant de filtre les trie, un composant de liste les pagine et affiche les cartes.
- **Les modales utilisent l'élément HTML `<dialog>`**, avec le contenu injecté par projection Angular.
- **Le glisser-déposer** utilise les événements natifs du navigateur et un service RxJS qui indique aux autres composants qu'une carte est en cours de déplacement.
- **TypeScript en mode strict**, Prettier lancé avant chaque commit avec Husky.
- **Intégration continue** : vérification du formatage et build à chaque push sur `main`, déploiement sur GitHub Pages depuis la branche `release`.

## Ce que le projet montre

- Une application Angular structurée en composants et services.
- Le travail en équipe de six avec des règles communes : formatage automatique, CI, branches de release.
