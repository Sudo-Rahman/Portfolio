# Curling-Three-js | Rapport technique

## En bref

- **Projet académique** (L3 Informatique-Électronique, Université de Bourgogne) visant à réaliser une partie de curling interactive en 3D dans le navigateur.
- Utilise **Three.js** pour le rendu WebGL, avec **dat.GUI** pour le contrôle interactif de tous les paramètres (piste, pierres, balais, lancers).
- Les pierres sont modélisées par **trois surfaces de révolution** (`LatheGeometry`) raccordées avec une **jointure G1** via des courbes de Bézier cubiques.
- Trois modes de lancer : rectiligne, courbe de Bézier avec jointure G1, et courbe de Bézier simple (sans jointure).
- Gestion complète des **chocs entre pierres**, du **hors-piste**, d'un **système de score** par distance au centre de la maison, et d'une **caméra de suivi** pendant les lancers.
- Auteurs : **Rahman Yilmaz** et **Lucie Dubost** — module IE3-00-2b (Synthèse d'images), professeur Lionel Garnier, décembre 2021.

## Contexte et objectif

Ce projet s'inscrit dans le cadre du module Info3B — Synthèse d'images du semestre 3 de la Licence Informatique-Électronique de l'Université de Bourgogne. L'objectif pédagogique est de mettre en pratique les concepts de synthèse d'images 3D : modélisation géométrique (surfaces de révolution, courbes de Bézier), matériaux et éclairage (modèle Phong), animation par images-clés, et projection orthographique/perspective.

Le cahier des charges imposait des contraintes précises :
- Construction des pierres à l'aide d'au moins trois surfaces de révolution avec raccord G1.
- Construction des balais avec cylindre, parallélépipède et cônes.
- Déplacements rectiligne et non-rectiligne via des courbes de Bézier (avec jointure G1).
- Un menu permettant de modifier la trajectoire de la pierre via les balais.
- Calcul et affichage du score en HTML.

Les auteurs ont ajouté plusieurs fonctionnalités au-delà du sujet : personnalisation avancée des objets avant la partie, gestion du hors-piste, chocs réactifs entre pierres, ombres portées, réflectivité de la glace et caméra de suivi.

## Fonctionnalités

- **Partie complète de curling** : 2 équipes de 5 pierres, 10 lancers alternés, score calculé après chaque lancer.
- **Trois types de lancer** : rectiligne, Bézier avec jointure G1 (deux courbes quadratiques raccordées), Bézier simple (une seule courbe).
- **Paramétrage en temps réel** via dat.GUI : dimensions de la piste, taille et couleurs des pierres/balais, force de lancer, force de frottement, point de contrôle de la courbe.
- **Détection de chocs** : collision par comparaison de la distance entre centres avec la somme des rayons ; animation de rebond directionnel.
- **Gestion du hors-piste** : une pierre sortant des limites de la piste est retirée de la scène et exclue du calcul de score.
- **Tableau de score HTML** : distances au centre de la maison affichées pour chaque lancer et chaque équipe, coloriées à la couleur de l'équipe en tête.
- **Animations de balais** : va-et-vient synchronisé avec le déplacement de la pierre lors du lancer.
- **Caméra de suivi** : la caméra suit la pierre en déplacement, puis se repositionne en vue d'ensemble à la fin du lancer.
- **Éclairage et ombres** : lumière directionnelle avec shadow mapping (`PCFSoftShadowMap`), lumière ambiante, matériaux Phong avec spécularité.
- **Prévisualisation de la trajectoire** : la ligne de lancer est affichée dans la scène avant que le joueur ne déclenche l'animation.

## Architecture (vue d'ensemble)

```
Curling-Three-js/
├── init/
│   ├── html/
│   │   └── init.html          # Point d'entrée HTML, charge tous les scripts
│   ├── css/
│   │   └── init.css           # Styles du tableau de score et du canvas WebGL
│   ├── js/
│   │   ├── Projet.js          # Boucle principale : init(), GUI, logique de partie
│   │   ├── classe.js          # Classe Pierrre (domain object : état + trajectoires)
│   │   ├── objet.js           # Fonctions constructrices Piste(), Balai(), Pierre()
│   │   ├── fonction.js        # Utilitaires : caméra, chocs, calcul de distances
│   │   ├── variable.js        # État global (variables de session)
│   │   └── autres/
│   │       ├── demarrage.js   # Bootstrap WebGL : renderer, scène, lumières
│   │       ├── CameraLumiere.js # Configuration caméra et lumières point
│   │       └── GeometrieUtile.js # Helpers : segment, repère, GUI caméra
│   └── asset/                 # Textures (glace, bois) — non utilisées (CORS)
├── libs/
│   ├── three/                 # Three.js + OrbitControls + ThreeBSP
│   └── util/                  # dat.GUI, Stats.js
├── DubostYilmaz.pdf           # Rapport académique du projet
└── README.md
```

**Organisation logique :**

L'application suit un modèle procédural centré sur l'initialisation. Le point d'entrée est la fonction `init()`, appelée au chargement de la page (`<body onload="init()">`). Cette fonction orchestre :

1. **Bootstrap WebGL** (`demarrage.js`) — crée le renderer, la scène, les lumières, les contrôles Trackball et lance la boucle de rendu.
2. **Déclaration des paramètres** — fonctions constructrices anonymes servant de DTO pour chaque objet configurable (piste, balai, pierre, lancer, partie).
3. **Construction des objets 3D** — appels aux fonctions `Piste()`, `Balai()`, `Pierre()` dans `objet.js`.
4. **Construction du GUI** — six dossiers dat.GUI (Camera, Piste, balai, Pierre, Partie, lancer) avec callbacks `onChange`.
5. **Logique de jeu** — encapsulée dans les callbacks du GUI : gestion des tours via `compteur`, détection de chocs, mise à jour du score.

La classe `Pierrre` (trois « r ») dans `classe.js` encapsule l'état métier d'une pierre (équipe, distance, lancer actif, hors-piste) et les trois méthodes de calcul de trajectoire. L'état global est maintenu via des variables simples dans `variable.js`.

## Choix techniques et raisons

### 1. Three.js sans bundler, scripts chargés via `<script>`

Le projet utilise Three.js en inclusion directe (pas de module ES, pas de bundler). C'est le pattern historique de Three.js et le plus simple pour un projet académique. Tous les scripts sont chargés dans un ordre précis dans `init.html`, garantissant que chaque fonction globale est disponible au moment où elle est appelée.

### 2. Surfaces de révolution avec LatheGeometry et Bézier cubique

Les pierres sont le cœur du sujet. Chaque pierre combine trois `LatheGeometry` dont les profils sont générés par des `CubicBezierCurve3`. Les points de contrôle sont choisis pour garantir une **continuité G1** (tangentes alignées) aux raccords. Cette approche démontre la maîtrise des courbes paramétriques appliquées à la géométrie de révolution.

### 3. Animation par discrétisation non uniforme de la trajectoire

Plutôt que d'utiliser un moteur physique, les trajectoires sont pré-calculées sous forme de tableaux de points `Vector3`. L'animation frame-by-frame déplace la pierre le long de ces points. Un **ralentissement progressif** est obtenu en augmentant la densité de points en fin de trajectoire (intervalles plus serrés), simulant la décélération par frottement.

### 4. Détection de chocs par distance euclidienne

La collision est détectée lorsque la distance entre les centres de deux pierres est inférieure à la somme de leurs rayons. Le rayon est approximé à partir de la géométrie de la `LatheGeometry`. Lors d'un choc, un vecteur directionnel normalisé détermine la trajectoire de recul, avec une force proportionnelle au lancer initial.

### 5. dat.GUI comme unique interface utilisateur

Toute l'interaction se fait via dat.GUI — pas de boutons HTML personnalisés. Cela permet une itération rapide sur les paramètres sans écrire d'UI, mais limite l'ergonomie. Les dossiers GUI (Camera, Piste, Pierre, balai, Partie, lancer) organisent les dizaines de paramètres disponibles.

### 6. Gestion du state global par variables simples

Pas de framework state management : l'état de la partie (compteur de tours, phase de lancer, pierre active) est géré par des variables globales (`etat_partie`, `compteur`, `lancer_ok_point_d_interogation`). Ce choix est cohérent avec la portée du projet et l'absence de framework.

### 7. Éclairage multi-sources avec shadow mapping

Deux lumières directionnelles et une lumière ambiante composent l'éclairage. Les ombres sont activées via `PCFSoftShadowMap` avec des shadow maps de 2000×2000 pixels. Les matériaux `MeshPhongMaterial` avec spécularité élevée (`shininess: 100`) simulent la réflexion sur la glace.

### 8. Caméra Trackball + suivi dynamique

Les `TrackballControls` permettent la navigation libre avec la souris. Pendant un lancer, la caméra bascule en mode suivi (`camera_suivie`) qui rejoint dynamiquement la position de la pierre. Après le lancer, `camera_reset_pos` replace la caméra en vue d'ensemble.

## Extraits de code remarquables

### Extrait 1 — Construction d'une pierre par surfaces de révolution avec jointure G1

**Fichier :** `init/js/objet.js` (lignes 113–215)

```javascript
// Création de la pierre
function Pierre(param) {
    // Trois surfaces de révolution raccordées par jointure G1
    // --- Surface basse : CubicBezierCurve3 -> LatheGeometry ---
    let P0 = new THREE.Vector3(0.05 + param.taille * 0.3, 0, 0);
    let P1 = new THREE.Vector3(param.taille * 1.35, param.taille * 0.2, 0);
    let P2 = new THREE.Vector3(param.taille * 1.3, param.taille * 0.6, 0);
    let G1 = new THREE.Vector3(param.taille * 1.3, param.taille * 0.6, 0);
    let cbeBez = new THREE.CubicBezierCurve3(P0, P1, P2, G1);
    const points = cbeBez.getPoints(15);
    const surface_bas = new THREE.Mesh(
        new THREE.LatheGeometry(points, 150, 0, 2 * Math.PI),
        new THREE.MeshPhongMaterial({ color: param.coul, side: THREE.DoubleSide })
    );

    // --- Surface milieu : couleur différente, raccord G1 au point G1 ---
    let A1 = new THREE.Vector3(param.taille * 1.3, param.taille * 0.6, 0);
    let A2 = new THREE.Vector3(param.taille * 1.3, param.taille * 0.6, 0);
    let G2 = new THREE.Vector3(param.taille * 1.3, param.taille * 0.8, 0);
    let cbeBezA = new THREE.CubicBezierCurve3(G1, A1, A2, G2);
    const pointsA = cbeBezA.getPoints(15);
    const surface_milieu = new THREE.Mesh(
        new THREE.LatheGeometry(pointsA, 150, 0, 2 * Math.PI),
        new THREE.MeshPhongMaterial({ color: param.coulCentre, side: THREE.DoubleSide })
    );

    // --- Surface haute : même couleur que la base, raccord G1 au point G2 ---
    let M0 = new THREE.Vector3(0.05 + param.taille * 0.3, param.taille * 0.6 + G2.y, 0);
    let M1 = new THREE.Vector3(param.taille * 1.3, param.taille * 0.2 + G1.y, 0);
    let M2 = new THREE.Vector3(param.taille * 1.35, param.taille * 0.6 + G1.y, 0);
    let cbeBezM = new THREE.CubicBezierCurve3(G2, M1, M2, M0);
    const pointsM = cbeBezM.getPoints(15);
    const surface_haut = new THREE.Mesh(
        new THREE.LatheGeometry(pointsM, 150, 0, 2 * Math.PI),
        new THREE.MeshPhongMaterial({ color: param.coul, side: THREE.DoubleSide })
    );

    const group = new THREE.Group();
    group.add(surface_bas_circle, surface_bas, surface_milieu, surface_haut,
              surface_haut_circle, endroit_pour_tenir_geometry, endroit_pour_tenir_geometry1);
    for (let i = 0; i < group.children.length; i++) {
        group.children[i].castShadow = true;
    }
    return group;
}
```

**Pourquoi c'est intéressant :** C'est le cœur du sujet académique. Trois `CubicBezierCurve3` génèrent les profils de révolution, chacun se terminant au point de départ du suivant (`G1` puis `G2`). Les tangentes aux raccords sont alignées par construction (P2 = G1 = A1), garantissant la continuité G1. La `LatheGeometry` avec 150 segments de rotation produit un objet lisse.

---

### Extrait 2 — Déplacement Bézier avec jointure G1 entre deux courbes

**Fichier :** `init/js/classe.js` (lignes 58–111)

```javascript
deplacementBezier(distance, intensite) {
    let departx = this.pierre.position.x;
    let departy = this.pierre.position.y;
    let arrivex = distance / 100 * vectcentreMaison.x
                  + (Math.random() < 0.5 ? -0.1 : 0.1);
    let arrivey = vectcentreMaison.y
                  + (Math.random() < 0.5 ? -0.1 : 0.1);
    let milieux = (departx + arrivex) / 2;
    let milieuy = (departy + arrivey) / 2;

    // Première courbe de Bézier
    const curve1 = new THREE.QuadraticBezierCurve(
        new THREE.Vector2(departx, departy),
        new THREE.Vector2(milieux / 2, (paramPiste.largeur + piste.position.y) * intensite),
        new THREE.Vector2(milieux, milieuy) // point de jointure
    );

    // Seconde courbe — le premier point = dernier point de curve1 (jointure G1)
    // Le point de contrôle est aligné avec la jointure et le ctrl de curve1
    const curve2 = new THREE.QuadraticBezierCurve(
        new THREE.Vector2(milieux, milieuy),
        new THREE.Vector2(milieux * 1.5, -(paramPiste.largeur + piste.position.y) * intensite),
        new THREE.Vector2(arrivex, arrivey)
    );

    const points1 = curve1.getPoints(150);
    const points2 = curve2.getPoints(300);

    // Regroupement visuel des deux lignes
    let groupe = new THREE.Group();
    groupe.add(curveObject, curveObject1);

    // Répartition non uniforme pour simuler la décélération
    let points = [];
    for (let i = 0; i < points1.length; i++) points.push(points1[i]);
    for (let i = 0; i < points2.length; i++) {
        if (i < 200) { if (i % 2 === 0) points.push(points2[i]); }
        else { points.push(points2[i]); }
    }
    return [groupe, points];
}
```

**Pourquoi c'est intéressant :** La jointure G1 est assurée par le fait que `curve1.getPoint(1) === curve2.getPoint(0)` (point `(milieux, milieuy)`). Le point de contrôle de `curve2` est positionné symétriquement par rapport à l'axe de la piste (`-intensite` vs `+intensite`), créant une trajectoire en S. La décélération est simulée par un sous-échantillonnage progressif : les premiers points sont pris un sur deux, puis tous — ce qui accélère la pierre en début de trajectoire et la ralentit en fin.

---

### Extrait 3 — Détection et animation des chocs entre pierres

**Fichier :** `init/js/fonction.js` (lignes 34–81)

```javascript
function chocDetected(force) {
    for (let i = 0; i < pierres.length; i++) {
        if (pierres[i].lancer !== false && !pierres[i].hors_piste) {
            for (let y = 0; y < pierres.length; y++) {
                if (pierres[y].lancer !== false && !pierres[y].hors_piste) {
                    if (i !== y) {
                        let posi = new THREE.Vector3(
                            pierres[i].pierre.position.x,
                            pierres[i].pierre.position.y,
                            pierres[i].pierre.position.z
                        );
                        let posy = new THREE.Vector3(
                            pierres[y].pierre.position.x,
                            pierres[y].pierre.position.y,
                            pierres[y].pierre.position.z
                        );
                        let distance = posi.distanceTo(posy);
                        if (distance < pierres[i].rayon + pierres[y].rayon) {
                            var dir = new THREE.Vector3().normalize();
                            dir.subVectors(posi, posy);
                            chocanime(pierres[i], dir, force);
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function chocanime(pierre, direction, force) {
    let x = direction.x * 0.014;
    let y = direction.y * 0.014;
    let i = 0;
    function anime() {
        if (i < Math.round(force * 2)) {
            requestAnimationFrame(anime);
            pierre.pierre.position.x += x;
            pierre.pierre.position.y += y;
        }
        i++;
        chocDetected(force); // détection récursive de chocs en chaîne
        calculeDistancetoMaison();
    }
    anime();
}
```

**Pourquoi c'est intéressant :** La détection de chocs fonctionne en O(n²) sur les pierres actives, ce qui est acceptable ici (maximum 10 pierres). Le point remarquable est l'appel récursif à `chocDetected` dans `chocanime` : lorsqu'une pierre est poussée par un choc, elle peut elle-même percuter une autre pierre, créant des réactions en chaîne. Le vecteur directionnel est calculé par `subVectors`, donnant un rebond réaliste dans la direction opposée à la collision.

---

### Extrait 4 — Calcul de distance au centre de la maison et gestion du hors-piste

**Fichier :** `init/js/fonction.js` (lignes 84–98)

```javascript
function calculeDistancetoMaison() {
    for (let i = 0; i < pierres.length; i++) {
        if (pierres[i].lancer) {
            // Vérification du hors-piste par bornes de la piste
            if (pierres[i].pierre.position.x > paramPiste.longueur / 2 + piste.position.x
                || -pierres[i].pierre.position.x > paramPiste.longueur / 2 + piste.position.x
                || pierres[i].pierre.position.y > paramPiste.largeur / 2 + piste.position.y
                || -pierres[i].pierre.position.y > paramPiste.largeur / 2 + piste.position.y) {
                scene.remove(pierres[i].pierre);
                pierres[i].distance = null;
                pierres[i].hors_piste = true;
            } else {
                pierres[i].distance = Math.round(
                    vectcentreMaison.distanceTo(
                        new THREE.Vector2(pierres[i].pierre.position.x,
                                          pierres[i].pierre.position.y)
                    ) * 100
                ) / 100;
            }
        }
    }
}
```

**Pourquoi c'est intéressant :** Le hors-piste est géré par comparaison avec les bornes de la piste, qui sont dynamiques (modifiables via le GUI). La distance au centre de la maison (`circle4`) est calculée via `Vector2.distanceTo()`, arrondie à deux décimales. Les pierres hors-piste sont retirées de la scène et exclues du score — un choix de design qui récompense les tirs précis.

---

### Extrait 5 — Bootstrap WebGL avec shadow mapping et multi-lumières

**Fichier :** `init/js/autres/demarrage.js` (lignes 1–103, extrait)

```javascript
function demarage() {
    let rendu = new THREE.WebGLRenderer({ antialias: true });
    rendu.shadowMap.enabled = true;
    rendu.shadowMapSoft = true;
    rendu.shadowMap.type = THREE.PCFSoftShadowMap;
    rendu.setClearColor(new THREE.Color(0xFFFFFF));
    rendu.setSize(window.innerWidth * .9, window.innerHeight * .9);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);

    // Lumière directionnelle principale (avec ombres)
    let light1 = new THREE.DirectionalLight(0xFFFFFF, 0.5, 100);
    light1.position.set(-25, 25, 80);
    light1.target.position.set(0, 0, 0);
    light1.shadow.mapSize.width = 2000;
    light1.shadow.mapSize.height = 2000;
    light1.castShadow = true;
    scene.add(light1, light1.target);

    // Lumière directionnelle secondaire (sans ombres)
    let light = new THREE.DirectionalLight(0xFFFFFF, 0.5, 100);
    light.position.set(15, 0, 5);
    scene.add(light, light.target);

    // Lumière ambiante
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.3));

    // Contrôles Trackball
    const element = document.getElementById("webgl");
    let controls = new THREE.TrackballControls(camera, element);

    // Boucle de rendu continue
    function renduAnim() {
        requestAnimationFrame(renduAnim);
        rendu.render(scene, camera);
    }
    renduAnim();

    document.getElementById("webgl").appendChild(rendu.domElement);
}
```

**Pourquoi c'est intéressant :** La configuration du renderer illustre les compromis classiques de rendu WebGL : antialias activé, shadow maps haute résolution (2000×2000), type `PCFSoftShadowMap` pour des ombres douces. La boucle de rendu tourne en continu via `requestAnimationFrame`, indépendamment de l'état du jeu — un pattern standard pour les applications Three.js interactives.

---

### Extrait 6 — Classe métier Pierrre : encapsulation de l'état et des trajectoires

**Fichier :** `init/js/classe.js` (lignes 1–153, extrait)

```javascript
class Pierrre {
    constructor(param, equipe, couleur) {
        this.equipe = equipe;
        this.pierre = new Pierre(param);
        this.couleur = couleur;
        this.taille = param.taille;
        this.distance = null;
        this.lancer = false;
        this.hors_piste = false;
        this.rayon = new THREE.Vector3(
            this.pierre.position.x,
            this.pierre.position.y,
            this.pierre.position.z
        ).distanceTo(this.pierre.children[2].geometry.vertices[0]);
    }

    deplacementRectiligne(distance, intensite) {
        // 150 points avec densité croissante pour simuler la décélération
        // Phase 1 (0-75) : pas régulier rapide
        // Phase 2 (75-125) : pas divisé par 2, un point sur deux
        // Phase 3 (125+) : pas divisé par 3, trois points par itération
    }

    deplacement(points) {
        this.pierre.position.x = points.x;
        this.pierre.position.y = points.y;
    }
}
```

**Pourquoi c'est intéressant :** La classe sépare clairement les préoccupations : l'objet visuel Three.js (`this.pierre`), l'état du jeu (`equipe`, `distance`, `lancer`, `hors_piste`), et les méthodes de calcul de trajectoire. L'approximation du rayon à partir des vertices de la `LatheGeometry` est une approche pragmatique pour un objet non sphérique. Le pattern de décélération par densification de points (3 phases) est une alternative simple à un vrai moteur physique.

## Qualité, sécurité, maintenance

### Tests
Aucun test automatisé n'est présent. C'est un projet académique sans CI/CD ni framework de test.

### Lint / Format
Pas de configuration de linter ou de formateur. Le code est écrit en JavaScript vanilla sans transpilation.

### Gestion d'erreurs
La validation repose sur des `alert()` pour informer le joueur qu'une action est impossible (modification pendant une partie, lancer pendant un lancer en cours). Un mécanisme de debounce maison (via `setTimeout` + booléen `alertmess`) évite le spam d'alertes.

### Commentaires
Le code est abondamment commenté en français. Une passe de correction orthographique a été effectuée (commit `f87ac93`).

### Organisation
La séparation en fichiers est logique (objets, fonctions utilitaires, classe métier, bootstrap). L'absence de modules ES rend les dépendances implicites — l'ordre de chargement dans `init.html` est critique.

## Installation et ex exécution (local)

**Prérequis :** Un navigateur moderne avec support WebGL. Aucune compilation ni installation de dépendances n'est nécessaire.

**Exécution :**

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/Sudo-Rahman/Curling-Three-js.git
   ```

2. Servir le répertoire via un serveur HTTP local (nécessaire pour éviter les problèmes CORS avec les textures et les modules) :
   ```bash
   # Avec Python
   cd Curling-Three-js
   python3 -m http.server 8080

   # Ou avec Node.js
   npx serve .
   ```

3. Ouvrir [`http://localhost:8080/init/html/init.html`](http://localhost:8080/init/html/init.html) dans le navigateur.

4. Utiliser le panneau dat.GUI en haut à droite pour :
   - Configurer les objets (Piste, Pierre, balai) — **avant** de commencer la partie.
   - Démarrer la partie dans le dossier « Partie ».
   - Régler les paramètres de lancer (force, frottement, type de trajectoire) et cliquer sur « lancer ».

## Liens

- **GitHub :** [https://github.com/Sudo-Rahman/Curling-Three-js](https://github.com/Sudo-Rahman/Curling-Three-js)
- **GitHub original (mentionné dans le rapport) :** [https://github.com/Sudo-Rahman/projetinfo3B](https://github.com/Sudo-Rahman/projetinfo3B)
