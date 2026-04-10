# Projet-CWA (Cadmium) | Rapport technique

## En bref

- Application web de gestion de tâches (CRUD complet) construite avec **Angular 16** et **TypeScript**.
- Persistance 100 % côté client via `localStorage` — aucun back-end ni base de données requis.
- Interface construite de zéro avec **Tailwind CSS** (aucune librairie de composants type Angular Material).
- Fonctionnalités avancées : filtrage multi-critères, tri, pagination, glisser-déposer (drag & drop), modals natives `<dialog>`.
- Pipeline CI/CD complet : Prettier + build sur `main`, déploiement automatique sur GitHub Pages depuis la branche `release`.
- Projet universitaire de **Conception Web Avancée** réalisé en équipe de 6 personnes.

---

## Contexte et objectif

Ce projet s'inscrit dans un cours de Conception Web Avancée (CWA). L'objectif pédagogique est d'évaluer les compétences en **TypeScript** et **Angular** à travers le développement d'une application de gestion de tâches (to-do list) nommée **Cadmium**.

L'application doit permettre à un utilisateur de :

- Créer, afficher, modifier et supprimer des tâches (CRUD).
- Filtrer les tâches par statut et par priorité.
- Trier les tâches par date d'échéance ou par niveau de priorité.
- Marquer une tâche comme terminée.
- Confirmer la suppression d'une tâche via un dialogue modal.

Le parti-pris de l'équipe a été de **ne pas utiliser de librairie de composants** (Angular Material, PrimeNG, etc.) afin de démontrer la capacité à construire une interface complète entièrement sur mesure — un choix explicitement motivé dans le rapport du projet.

**Dépôt GitHub :** <https://github.com/Phaired/Projet-CWA>

---

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Page d'accueil** | Affiche la liste des tâches sous forme de cartes dans une grille responsive. Indique le nombre total de tâches. |
| **Création de tâche** | Formulaire complet (nom, description, priorité via slider, date de fin, couleur) avec validation (min. 3 caractères pour le nom, min. 10 pour la description). |
| **Détail de tâche** | Vue détaillée dans un modal : titre, description, priorité (barre visuelle), dates de création/fin, couleur, statut (checkbox readonly). |
| **Modification de tâche** | Formulaire pré-rempli dans un modal, avec les mêmes validations que la création. |
| **Suppression de tâche** | Confirmation via modal (boutons « Supprimer » / « Annuler »). |
| **Drag & Drop** | Glisser une carte vers des zones de drop latérales pour déclencher la suppression — UX alternative au bouton poubelle. |
| **Filtrage** | Par statut (toutes / en cours / terminées) et par priorité (toutes / faible / moyenne / haute). |
| **Tri** | Par date d'échéance, par priorité, ou par ID (défaut). |
| **Pagination** | 12 tâches par page avec navigation animée (slide gauche/droite). |
| **Actions rapides** | Au survol d'une carte : icônes pour supprimer, modifier, marquer comme terminée. |
| **Visualisation des priorités** | Couleur de la bordure de la carte calculée automatiquement selon la priorité (bleu → jaune → rouge). |
| **Page Contact** | Affiche les membres de l'équipe avec liens vers leurs profils GitHub. |

---

## Architecture (vue d'ensemble)

```
src/app/
├── app.module.ts                    # Module racine Angular
├── app-routing.module.ts            # Routes principales (/, /contact)
├── app.component.ts|html|css        # Shell : navbar + <router-outlet>
├── model/
│   └── Tache.ts                     # Modèle de domaine + enum Priority
├── repository/
│   ├── LocalStorageRepository.ts    # Couche d'accès aux données (localStorage)
│   └── local-storage-repository.service.ts  # Service Angular injectable
├── components/
│   ├── card/                        # Carte d'une tâche (drag, actions)
│   ├── list/                        # Grille paginée de cartes + zones de drop
│   ├── filter/                      # Logique de filtrage/tri (pas de template)
│   ├── modal/                       # Modal réutilisable basé sur <dialog>
│   └── navbar/                      # Barre de navigation
├── pages/
│   ├── home/                        # Page d'accueil (orchestrateur principal)
│   ├── create-task/                 # Formulaire de création
│   ├── modify-task/                 # Formulaire de modification
│   ├── delete-task/                 # Confirmation de suppression
│   ├── detail/                      # Vue détaillée d'une tâche
│   └── contact/                     # Page de l'équipe
├── drag-state.service.ts            # Service réactif pour l'état du drag & drop
```

**Flux de données :**

1. `HomeComponent` charge les tâches depuis `LocalStorageRepositoryService` au constructeur.
2. La liste est passée via `@Input()` à `FilterComponent` (logique de tri/filtre) puis à `ListComponent` (affichage paginé).
3. `ListComponent` rend des `CardComponent` via `@ViewChildren` pour communiquer avec chaque carte.
4. `DragStateService` (BehaviourSubject RxJS) maintient l'état global du drag pour afficher/masquer les zones de drop.
5. `ModalComponent` encapsule un `<dialog>` HTML natif et expose `openModal()` / `closeModal()` via `@ViewChild`.

---

## Choix techniques et raisons

### 1. Persistance via localStorage (sans back-end)

Le rapport le précise : l'équipe a fait le choix de stocker les données dans le `localStorage` du navigateur plutôt que de développer une API et une base de données. La classe `LocalStorageRepository` sérialise l'intégralité des tâches en JSON sous une clé unique (`CADMIUM_TASKS`). Ce choix simplifie considérablement le déploiement (application statique sur GitHub Pages) au prix d'une limitation à un seul navigateur et d'une capacité de stockage limitée.

### 2. Tailwind CSS sans librairie de composants

L'UI est entièrement construite avec **Tailwind CSS v3**. Aucune librairie tierce de composants n'est utilisée. Le fichier `styles.css` contient un reset CSS complet et personnalisé (margin/padding/border reset pour tous les éléments HTML), suivi des directives Tailwind (`@tailwind base/components/utilities`). Un thème de couleurs personnalisé `blue-chill` est défini dans `tailwind.config.js`.

### 3. Modals HTML natifs (`<dialog>`)

Le composant `ModalComponent` utilise l'élément HTML5 `<dialog>` avec ses méthodes natives `showModal()` et `close()`. L'approche est minimaliste : le contenu est projeté via `<ng-content>`, et un clic sur le backdrop ferme le modal. Cela évite d'introduire une dépendance lourde de type overlay.

### 4. Drag & Drop avec service réactif (RxJS)

L'interaction de glisser-déposer repose sur les APIs natives du navigateur (`dragstart`, `dragend`, `drop`, `dragover`) combinées à un `BehaviorSubject` dans `DragStateService`. Ce pattern permet à `ListComponent` de réagir en temps réel pour afficher les zones de drop latérales uniquement pendant le drag.

### 5. Animations Angular

`ListComponent` déclare une animation `slideAnimation` via `@angular/animations` avec deux transitions directionnelles (`left` et `right`) pour animer le changement de page. Chaque carte hérite de cette animation via le trigger `[@slideAnimation]`.

### 6. TypeScript strict

Le `tsconfig.json` active les options les plus strictes : `strict: true`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `strictInjectionParameters`, `strictInputAccessModifiers`, `strictTemplates`. Ce niveau de rigueur est inhabituel pour un projet étudiant et témoigne d'une volonté de qualité.

### 7. CI/CD avec GitHub Actions

Deux workflows complémentaires :
- **`integration.yml`** : déclenché sur push/PR vers `main`. Lance `npm ci`, vérifie le formatage Prettier (`npm run test-format`), puis exécute le build (`npm run build`).
- **`deployment.yml`** : déclenché sur push vers `release`. Build l'application avec `--deploy-url=/Projet-CWA/` et déploie sur GitHub Pages via les actions officielles `upload-pages-artifact` et `deploy-pages`.

### 8. Husky + Prettier pour le formatage local

Un hook pre-commit Husky exécute `npm run format` (Prettier) avant chaque commit, garantissant un style cohérent en local avant même que la CI ne le vérifie.

---

## Extraits de code remarquables

### Extrait 1 — Modèle de domaine avec énumération et factory

**Fichier :** `src/app/model/Tache.ts`

```typescript
interface ITache {
    intitule: string;
    date_creation: Date;
    date_fin: Date;
    description: string;
    priority: number;
    is_terminate: boolean;
    color: string;
}

export class Tache implements ITache {
    id: number;
    intitule: string;
    date_creation: Date;
    date_fin: Date;
    description: string;
    priority: number;
    is_terminate: boolean;
    color: string;

    constructor(
        id: number, intitule: string, date_creation: Date, date_fin: Date,
        description: string, priority: number, is_terminate: boolean, color: string,
    ) {
        this.id = id;
        this.intitule = intitule;
        this.date_creation = date_creation;
        this.date_fin = date_fin;
        this.description = description;
        this.priority = priority;
        this.is_terminate = is_terminate;
        this.color = color;
    }

    public static colorToPriority(priority: Priority): string {
        switch (priority) {
            case Priority.BASE: return '#38bdf8';
            case Priority.MEDIUM: return '#fbbf24';
            case Priority.HIGH: return '#dc2626';
        }
    }

    public static fromTache(tache: Tache): Tache {
        return new Tache(
            tache.id, tache.intitule, tache.date_creation, tache.date_fin,
            tache.description, tache.priority, tache.is_terminate, tache.color,
        );
    }
}

export enum Priority {
    BASE = 1,
    MEDIUM,
    HIGH,
}
```

**Pourquoi c'est intéressant :** Le modèle est structuré avec une interface `ITache` pour le contrat, une classe concrète avec constructeur explicite, et deux méthodes statiques utilitaires. `colorToPriority` centralise la logique de coloration sémantique (bleu = faible, jaune = moyen, rouge = haut). `fromTache` agit comme un constructeur par copie, utilisé notamment dans `ModifyTaskComponent` pour travailler sur un clone et ne modifier la tâche originale qu'à la sauvegarde.

---

### Extrait 2 — Couche de persistance localStorage

**Fichier :** `src/app/repository/LocalStorageRepository.ts`

```typescript
import { Tache } from '../model/Tache';

export interface IExportTaches {
    tasks: Array<Tache>;
    other: object;
}

export class LocalStorageRepository {
    public static readonly ORDER_ASC: number = 1;
    public static readonly ORDER_DESC: number = -1;
    private readonly key: string;

    constructor() {
        this.key = 'CADMIUM_TASKS';
        window.localStorage.getItem(this.key) === null
            ? window.localStorage.setItem(
                  this.key,
                  JSON.stringify({ tasks: [], other: {} } as IExportTaches),
              )
            : null;
    }

    public getAllTaches(): Array<Tache> {
        return (
            JSON.parse(window.localStorage.getItem(this.key) as string) as IExportTaches
        ).tasks;
    }

    public getLastId(): number {
        const taches: Array<Tache> = this.getAllTaches();
        return taches.length > 0 ? taches[taches.length - 1].id : 0;
    }

    public saveTache(tache: Tache): void {
        const taches: Array<Tache> = this.getAllTaches();
        taches.push(tache);
        window.localStorage.setItem(
            this.key,
            JSON.stringify({ tasks: taches, other: {} } as IExportTaches),
        );
    }

    public deleteTache(tache: Tache): void {
        const taches: Array<Tache> = this.getAllTaches();
        const index: number = taches.findIndex((item: Tache) => item.id === tache.id);
        if (index !== -1) {
            taches.splice(index, 1);
            window.localStorage.setItem(
                this.key,
                JSON.stringify({ tasks: taches, other: {} } as IExportTaches),
            );
        }
    }

    public updateTacheById(id: number, newTache: Tache): void {
        const previousTache: Tache = this.getTacheById(id);
        this.updateTache(previousTache, newTache);
    }
}
```

**Pourquoi c'est intéressant :** L'interface `IExportTaches` avec un champ `other: object` prévoit l'ajout futur de métadonnées (par exemple des préférences utilisateur). Le constructeur initialise le store s'il n'existe pas. Les méthodes `getAllTachesByDateCreation` et `getAllTachesByPriority` sont annotées `@deprecated` avec un message pointant vers `FilterComponent`, montrant que la logique de tri a été migrée du repository vers le composant de filtre — un refactoring conscient.

---

### Extrait 3 — Service de drag réactif (RxJS BehaviorSubject)

**Fichier :** `src/app/drag-state.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DragStateService {
    private draggingSource = new BehaviorSubject<boolean>(false);
    dragging$ = this.draggingSource.asObservable();

    startDragging() {
        this.draggingSource.next(true);
    }

    stopDragging() {
        this.draggingSource.next(false);
    }
}
```

**Pourquoi c'est intéressant :** C'est un cas d'usage classique de `BehaviorSubject` pour un état global transversal. `ListComponent` souscrit à `dragging$` pour afficher/masquer les zones de drop, tandis que `CardComponent` émet `startDragging()` / `stopDragging()` sur les événements natifs `dragstart` / `dragend`. Ce pattern découple proprement l'émetteur du récepteur sans passer par un `@Output()` en cascade.

---

### Extrait 4 — Modal réutilisable avec `<dialog>` natif

**Fichier :** `src/app/components/modal/modal.component.ts` + `modal.component.html`

```typescript
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
    @ViewChild('modalDialog') modalDialog:
        | ElementRef<HTMLDialogElement> | undefined;

    openModal() {
        if (this.modalDialog && this.modalDialog.nativeElement) {
            this.modalDialog.nativeElement.showModal();
        }
    }

    closeModal() {
        if (this.modalDialog && this.modalDialog.nativeElement) {
            this.modalDialog.nativeElement.close();
        }
    }
}
```

```html
<dialog #modalDialog (click)="closeModal()" class="rounded-lg">
    <div (click)="$event.stopPropagation()">
        <ng-content></ng-content>
        <button (click)="closeModal()" class="close-button">
            <!-- SVG de fermeture -->
        </button>
    </div>
</dialog>
```

**Pourquoi c'est intéressant :** L'approche est élégante : l'élément `<dialog>` natif gère l'overlay et le focus trap automatiquement, sans dépendance externe. Le clic sur le backdrop ferme le modal (via `(click)="closeModal()"` sur le `<dialog>`), tandis que le `$event.stopPropagation()` sur le contenu empêche la fermeture lors d'un clic à l'intérieur. La projection de contenu via `<ng-content>` permet d'injecter n'importe quel composant enfant (détail, modification, suppression).

---

### Extrait 5 — Grille paginée avec animations

**Fichier :** `src/app/components/list/list.component.ts`

```typescript
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    /* ... */
    animations: [
        trigger('slideAnimation', [
            transition('* => left', [
                style({ transform: 'translateX(-100%)', opacity: 0 }),
                animate('0.5s ease-in-out',
                    style({ transform: 'translateX(0)', opacity: 1 })),
            ]),
            transition('* => right', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('0.5s ease-in-out',
                    style({ transform: 'translateX(0)', opacity: 1 })),
            ]),
        ]),
    ],
})
export class ListComponent {
    protected itemsPerPage: number = 12;
    protected currentPage: number = 1;
    @Input() task_list: Tache[] = [];

    get paginatedTasks(): any[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.task_list.slice(startIndex, startIndex + this.itemsPerPage);
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.slideDirection = 'left';
            this.currentPage--;
        }
    }

    nextPage(): void {
        if (this.endIndex < this.task_list.length) {
            this.slideDirection = 'right';
            this.currentPage++;
        }
    }
}
```

```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-11 mb-9">
    <ng-container>
        <app-card
            *ngFor="let task of paginatedTasks; let i = index"
            [@slideAnimation]="slideDirection"
            [task]="task"
            (deleteTask)="deleteTask($event)"
        ></app-card>
    </ng-container>
</div>
```

**Pourquoi c'est intéressant :** La pagination est implémentée côté composant avec un getter `paginatedTasks` qui slice la liste. Les animations directionnelles (slide gauche/droite) sont déclenchées par changement de la valeur `slideDirection`, ce qui donne un effet de carousel naturel. La grille Tailwind (`grid-cols-1` à `grid-cols-4`) assure la responsivité.

---

### Extrait 6 — Pipeline CI/CD GitHub Actions

**Fichier :** `.github/workflows/deployment.yml`

```yaml
name: Deployment

on:
    push:
        branches: ['release']
    workflow_dispatch:

permissions:
    contents: read
    pages: write
    id-token: write

concurrency:
    group: 'pages'
    cancel-in-progress: false

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v3
            - name: Detect package manager
              id: detect-package-manager
              run: |
                  if [ -f "${{ github.workspace }}/yarn.lock" ]; then
                    echo "manager=yarn" >> $GITHUB_OUTPUT
                  elif [ -f "${{ github.workspace }}/package.json" ]; then
                    echo "manager=npm" >> $GITHUB_OUTPUT
                    echo "runner=run build -- --deploy-url=/Projet-CWA/" >> $GITHUB_OUTPUT
                  fi
            - name: Setup Node
              uses: actions/setup-node@v3
              with:
                  node-version: '20'
            - name: Install dependencies
              run: ${{ steps.detect-package-manager.outputs.manager }} ci
            - name: Build Angular
              run: ${{ steps.detect-package-manager.outputs.manager }} ${{ steps.detect-package-manager.outputs.runner }}
            - name: Upload artifact
              uses: actions/upload-pages-artifact@v2
              with:
                  path: ./dist/cadmium

    deploy:
        environment:
            name: github-pages
            url: ${{ steps.deployment.outputs.page_url }}
        runs-on: ubuntu-latest
        needs: build
        steps:
            - name: Deploy to GitHub Pages
              uses: actions/deploy-pages@v2
```

**Pourquoi c'est intéressant :** Le workflow illustre un vrai pipeline de production : détection automatique du gestionnaire de paquets, build avec `--deploy-url` adapté au sous-chemin GitHub Pages (`/Projet-CWA/`), gestion de la concurrence pour éviter les déploiements simultanés, et séparation build/deploy en deux jobs avec artifacts. Le `workflow_dispatch` permet aussi des déploiements manuels.

---

### Extrait 7 — Validation et création de tâche

**Fichier :** `src/app/pages/create-task/create-task.component.ts`

```typescript
export class CreateTaskComponent {
    @Input() task_list: Tache[] = [];
    @Output() onConfirm: EventEmitter<number> = new EventEmitter<number>();
    name: string = '';
    description: string = '';
    color: string = Tache.colorToPriority(Priority.BASE);
    priority: number = Priority.BASE;
    date: Date | null = null;

    constructor(
        private localStorageRepositoryService: LocalStorageRepositoryService,
    ) {}

    createTask(): boolean {
        if (this.name.length >= 3 && this.date !== null && this.description.length >= 10) {
            const task = new Tache(
                this.localStorageRepositoryService
                    .getLocalStorageRepository().getLastId() + 1,
                this.name, new Date(), this.date,
                this.description, this.priority, false, this.color,
            );
            this.localStorageRepositoryService
                .getLocalStorageRepository().saveTache(task);

            let new_list: Tache[] = this.localStorageRepositoryService
                .getLocalStorageRepository().getAllTaches();
            new_list.map((tache) => {
                let index = this.task_list.findIndex((item) => item.id === tache.id);
                if (index === -1) { this.task_list.push(tache); }
            });
            this.name = ''; this.priority = 0;
            this.description = '';
            this.color = Tache.colorToPriority(Priority.BASE);
            this.date = null;
            this.onConfirm.emit(0);
            return true;
        }
        return false;
    }
}
```

**Pourquoi c'est intéressant :** La validation côté composant (longueur minimale du titre et de la description, date obligatoire) est complétée par des messages d'erreur contextuels dans le template via `*ngIf`. Après la sauvegarde, les champs sont réinitialisés et la liste parent est mise à jour par différentielle (on ne pousse que les nouvelles tâches). L'ID est auto-incrémenté via `getLastId() + 1`.

---

## Qualité, securite, maintenance

### Outils de qualité

| Outil | Rôle | Fichier de config |
|---|---|---|
| **Prettier** | Formatage automatique du code (tabWidth 4, single quotes, LF) | `.prettierrc.json` |
| **EditorConfig** | Consistance éditeur (charset UTF-8, indent 4 espaces, final newline) | `.editorconfig` |
| **Husky** | Hook pre-commit qui lance `npm run format` | `.husky/pre-commit` |
| **TypeScript strict** | `strict`, `noImplicitReturns`, `strictTemplates`, etc. | `tsconfig.json` |
| **Karma + Jasmine** | Framework de tests unitaires (configuré dans `angular.json`) | — |

### CI (Intégration continue)

Le workflow **`integration.yml`** vérifie à chaque push/PR sur `main` :
1. `npm ci` — installation déterministe des dépendances.
2. `npm run test-format` — vérification Prettier (échec si le code est mal formaté).
3. `npm run build` — vérifie que l'application compile sans erreur.

### CD (Déploiement continu)

Le workflow **`deployment.yml`** déploie automatiquement sur **GitHub Pages** à chaque push sur `release`. Le build utilise `--deploy-url=/Projet-CWA/` pour que les assets soient résolus correctement dans le sous-chemin.

### Tests

Des fichiers `.spec.ts` existent pour les services (`LocalStorageRepositoryService`, `DragStateService`) et le composant racine. Ils se contentent de vérifier que les services sont correctement instanciés via `TestBed`. Les tests de comportement métier (CRUD, filtrage, tri) ne sont pas implémentés — c'est une lacune identifiable.

### Gestion d'erreurs

La gestion d'erreurs est minimale : quelques `console.log` dans `LocalStorageRepository` pour le débogage, et des vérifications d'existence (ex. `index !== -1` avant `splice`). Il n'y a pas de gestion d'erreurs utilisateur-facing (notifications, toasts).

---

## Installation et execution (local)

### Prérequis

- **Node.js** ≥ 20 (cf. les workflows CI qui utilisent `node-version: '20'`)
- **npm** (inclus avec Node.js)
- **Angular CLI** 16.2.x (installé via `npm i`)

### Installation et lancement

```bash
# Cloner le dépôt
git clone https://github.com/Phaired/Projet-CWA.git
cd Projet-CWA

# Installer les dépendances
npm i

# Installer les hooks Git (Husky)
npm run prepare

# Lancer le serveur de développement
npm run start
# → Ouvrir http://localhost:4200/
```

### Autres commandes

```bash
npm run build          # Build de production (dist/cadmium/)
npm run test           # Tests unitaires Karma
npm run format         # Formater le code avec Prettier
npm run test-format    # Vérifier le formatage sans modifier les fichiers
npm run watch          # Build en mode watch (développement)
```

---

## Liens

- **Dépôt GitHub :** <https://github.com/Phaired/Projet-CWA>
- **Diagrammes du projet :** <https://github.com/Phaired/Projet-CWA/tree/main/rapport/screenshot/diagramme>
- **Rapport PDF (inclus dans le dépôt) :** `rapport/Rapport_CWA.pdf`
