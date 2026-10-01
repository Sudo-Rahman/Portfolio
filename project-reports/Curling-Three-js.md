# Curling-Three-js

Une partie de curling en 3D dans le navigateur, réalisée avec Three.js pour le module Synthèse d'images de la Licence Informatique-Électronique à l'Université de Bourgogne. Projet à deux, avec Lucie Dubost, rendu en décembre 2021.

## En bref

- **Contexte** : projet universitaire, L2 Informatique-Électronique, 2021.
- **Stack** : JavaScript, Three.js (WebGL), dat.GUI.
- **Équipe** : 2 personnes.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Curling-Three-js)

## Le sujet

Le cahier des charges était précis : modéliser les pierres avec au moins trois surfaces de révolution raccordées proprement, construire les balais à partir de formes simples, déplacer les pierres en ligne droite et le long de courbes de Bézier, et afficher le score.

Nous avons ajouté la personnalisation de la piste et des objets, les chocs entre pierres, la sortie de piste, les ombres et une caméra qui suit la pierre.

## Ce que fait l'application

- Une partie complète : deux équipes de cinq pierres, dix lancers en alternance, score recalculé après chaque lancer.
- Trois types de lancer : en ligne droite, le long d'une courbe de Bézier, ou de deux courbes raccordées.
- Un aperçu de la trajectoire avant de lancer.
- Des réglages en direct : taille de la piste, couleurs, force du lancer, frottement, point de contrôle de la courbe.
- Les chocs entre pierres, et le retrait d'une pierre sortie de la piste.
- Les balais qui balaient pendant que la pierre avance, et une caméra qui la suit puis revient en vue d'ensemble.

## Comment c'est construit

- **Les pierres** sont faites de trois `LatheGeometry`, des surfaces obtenues en faisant tourner un profil. Chaque profil est une courbe de Bézier cubique, et les points de contrôle sont choisis pour que les tangentes se raccordent sans cassure (continuité G1).
- **Les trajectoires** sont précalculées en listes de points, puis la pierre avance de point en point. Le ralentissement vient d'un pas qui diminue au fil du parcours, sans moteur physique.
- **Les chocs** sont détectés quand la distance entre deux centres devient plus petite que la somme des rayons ; la pierre touchée repart dans la direction du choc.
- **Le rendu** utilise deux lumières directionnelles avec ombres douces et des matériaux Phong pour donner un aspect brillant à la glace.

Toute l'interface passe par dat.GUI, ce qui permettait d'ajuster rapidement les paramètres sans écrire d'interface.

## Limites

- Pas de modules ni de bundler : les scripts dépendent de leur ordre de chargement dans la page.
- L'état de la partie est stocké dans des variables globales.
- Pas de tests automatisés.

## Ce que le projet montre

- Les bases de la synthèse d'images : surfaces de révolution, courbes de Bézier, éclairage et ombres.
- Une première application 3D interactive dans le navigateur.
