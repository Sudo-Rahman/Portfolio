# Vanadium (Projet-GL)

![Interface de Vanadium](https://raw.githubusercontent.com/Sudo-Rahman/Projet-GL/main/rapport/screenshot/ihm/ihm.png)

Vanadium est une application Java Swing de composition de paniers de fruits, réalisée à cinq pour le cours de Génie Logiciel. Le sujet est volontairement simple ; l'intérêt est ailleurs : conception orientée objet, tests, intégration continue et travail en équipe avec revue de code.

## En bref

- **Contexte** : projet universitaire de génie logiciel, 2023.
- **Stack** : Java 20, Swing, Maven, JUnit 5, Mockito, GitHub Actions.
- **Équipe** : 5 personnes (Maxime Colliat, Yoan Dusoleil, Rahman Yilmaz, Rémy Barranco, Julie Prigent).

## Liens

- [Code source](https://github.com/Sudo-Rahman/Projet-GL)

## Ce que fait l'application

- Choisir un contenant : panier, jus ou macédoine.
- Ajouter des oranges, bananes ou pommes avec leur prix, leur origine et leur quantité.
- Modifier ou retirer un fruit par clic droit.
- « Boycotter » un pays d'origine : tous les fruits de ce pays sont retirés.
- Voir en direct le prix total, le poids et le nombre de fruits.

## Comment c'est construit

- **MVC avec le patron Observateur** : le modèle notifie les vues à chaque changement, et les vues (l'interface Swing et une sortie console de débogage) se mettent à jour seules.
- **Fabriques** pour créer les fruits et les contenants à partir d'un type, ce qui évite les `new` éparpillés dans les contrôleurs.
- **Patron Composite** : une macédoine est à la fois un contenant et un fruit, donc une macédoine peut en contenir une autre.
- **Exceptions métier** (panier plein, panier vide…) interceptées par les contrôleurs pour afficher un message clair.

## Méthode et qualité

- Organisation agile, avec diagrammes de cas d'utilisation, de classes et de séquence, et planning (Gantt, PERT).
- Branche `main` protégée : chaque changement passe par une pull request relue et des tests verts.
- Dix classes de tests JUnit 5, avec Mockito pour tester le panier sans dépendre des vraies classes de fruits.
- Les tests de l'interface Swing tournent dans GitHub Actions grâce à un écran virtuel (`xvfb`).
- Un JAR est publié automatiquement en release à chaque fusion sur la branche `release`.

## Ce que le projet montre

- L'application de patrons de conception classiques sur un cas concret.
- Le travail en équipe avec revue de code, CI et releases automatisées.
