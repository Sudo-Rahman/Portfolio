# Before-After-Image

Une bibliothèque Android pour comparer deux images avec un curseur qu'on fait glisser : à gauche l'image « avant », à droite l'image « après ». C'est un composant Jetpack Compose prêt à l'emploi, publié via JitPack.

## En bref

- **Contexte** : bibliothèque open source, novembre 2023.
- **Stack** : Kotlin, Jetpack Compose, Coil, Gradle.
- **Licence** : Apache 2.0.
- **Compatibilité** : Android 6.0 (API 23) et plus.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Before-After-Image)
- [Paquet JitPack](https://jitpack.io/#Sudo-Rahman/BeforeAfterImage)

## Le besoin

Comparer deux versions d'une image revient souvent dans une application : retouche photo, filtre, traitement d'image. Le composant n'existait pas en Compose sous une forme simple, alors je l'ai écrit une fois pour pouvoir l'ajouter à n'importe quel projet avec une ligne de Gradle.

## Ce que fait le composant

- Un curseur horizontal qui révèle progressivement l'une ou l'autre image.
- Deux façons de fournir les images : des ressources locales (`Painter`) ou des URL chargées avec Coil.
- Des étiquettes « Before » et « After » cliquables, qui animent le curseur jusqu'au bout (500 ms, courbe `EaseInOutCubic`).
- Un curseur personnalisable : on peut passer son propre composable.
- La taille et le style se règlent avec le `Modifier` habituel de Compose.

## Comment c'est construit

Le dépôt a deux modules : la bibliothèque elle-même, en un seul fichier Kotlin, et une petite application de démonstration.

Les deux images sont superposées sur toute la surface du composant. Chacune est découpée avec `drawWithContent` et `clipRect`, en fonction de la position du curseur : l'une montre la partie gauche, l'autre la partie droite. Les deux fonctions publiques (images locales ou distantes) appellent le même composable interne, qui gère le curseur, l'animation et la mise en page.

La publication passe par le plugin `maven-publish` : JitPack construit l'AAR à chaque tag.

## Limites

- Pas de tests automatisés ni de CI ; la démo sert de test manuel.
- En mode distant, aucune image de remplacement n'est prévue si l'URL ne répond pas.

## Ce que le projet montre

- Un composant Compose réutilisable, avec une API réduite à l'essentiel.
- La publication d'une bibliothèque Android que d'autres projets peuvent installer.
