# Portfolio de Rahman Yilmaz

Bienvenue sur le dépôt de mon portfolio personnel. Ce site présente mon parcours, mes compétences et mes projets en tant que développeur mobile et full stack web.

## Aperçu

Mon portfolio est disponible en ligne à l'adresse suivante : [https://sudo-rahman.fr/](https://sudo-rahman.fr/)

## Fonctionnalités

- **Présentation personnelle** : Informations sur mon parcours académique et professionnel.
- **Projets** : Liste détaillée de mes projets avec des descriptions et des liens vers les dépôts correspondants.
- **Compétences** : Technologies et langages de programmation maîtrisés.
- **Expériences professionnelles** : Historique de mes expériences en entreprise.

## Direction artistique

Le site est un **tableau périodique** : chaque projet est un élément (symbole, numéro atomique chronologique, famille colorée d'après un test de flamme). La page d'accueil fait exploser une goutte de métal liquide iridescent (shader WebGL) en particules qui se recomposent en tableau ; les technologies forment une molécule 3D et le parcours est lu comme un spectre d'émission.

## Technologies utilisées

- **Framework** : SvelteKit 3, Svelte 5 (runes, attachments), TypeScript 6, Vite 8
- **Style** : Tailwind CSS 4, Mona Sans & Martian Mono (polices variables)
- **Animation** : GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText), Lenis, View Transitions API
- **3D** : Three.js r186 et shaders GLSL écrits à la main
- **Contenu** : `src/lib/data/*.ts` et `project-reports/*.md` (rendu avec marked)
- **Déploiement** : site statique pré-généré dans `portfolio/` (Node ≥ 22.17)

## Installation locale

Si vous souhaitez cloner et exécuter ce projet en local, suivez les étapes ci-dessous :

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/Sudo-Rahman/portfolio.git

    cd portfolio
    ```
2. **Installer les dépendances** :

    ```bash
    pnpm install
    ```
3. **Démarrer le serveur de développement** :

    ```bash
    pnpm run dev
    ```