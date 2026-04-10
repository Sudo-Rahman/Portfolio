# Gold Investment | Rapport technique

## En bref

- **Calculateur d'investissement or** en ligne : estime les gains potentiels d'un investissement dans l'or en fonction de la quantité, de la durée et des contributions supplémentaires.
- **Convertisseur de devises mondial** avec taux de change en temps réel issus de l'API Metals.dev.
- Stack moderne : **SvelteKit 5** + **TypeScript** + **Tailwind CSS** + **Shadcn-Svelte** + **ECharts**.
- Déploiement automatisé via **Docker** et **GitHub Actions** (build → Docker Hub → SSH deploy).
- Système de **cache fichier côté serveur** pour limiter les appels API et résister aux limites de quota.
- Interface **dark mode** par défaut, avec persistance des paramètres utilisateur dans `localStorage`.
- Prise en compte du **Zakat** (taxe religieuse islamique sur l'or) dans le calcul de la rentabilité.

## Contexte et objectif

Gold Investment est un outil web interactif destiné aux investisseurs particuliers souhaitant planifier et visualiser un investissement dans l'or physique. L'application permet de simuler plusieurs scénarios : quantité initiale détenue, contributions régulières (mensuelles ou annuelles), durée de détention, taux de rendement personnalisé et pureté du métal (22 ou 24 carats). Un second volet propose un convertisseur de devises couvrant plus de 170 devises mondiales avec des taux actualisés.

L'application est déployée en production à l'adresse [https://gold-investment.sudo-rahman.fr/](https://gold-investment.sudo-rahman.fr/). La page de conversion de devises est accessible à `/currencies`.

L'auteur est Rahman YILMAZ (GitHub : [Sudo-Rahman](https://github.com/Sudo-Rahman/gold-investment)).

## Fonctionnalités

### Calculateur d'investissement or

- **Simulation de rendement** : projection année par année de la valeur d'un portefeuille or, avec graphique interactif ECharts.
- **Séries temporelles** : visualisation de l'évolution du prix de l'or sur les 30 derniers jours (graphique lissé).
- **Multi-devises** : conversion automatique des valeurs dans la devise choisie par l'utilisateur (USD, EUR, GBP, TRY, etc.).
- **Carats** : choix entre or 22 carats et 24 carats, impactant directement le prix au gramme.
- **Contributions supplémentaires** : ajout de contributions mensuelles ou annuelles au calcul.
- **Zakat** : activation optionnelle de la taxe religieuse (2,5 % de la valeur de l'or détenue au-delà de 85 g), avec possibilité de déduire le montant du Zakat de l'investissement.
- **Persistance locale** : tous les paramètres du formulaire sont sauvegardés dans `localStorage` et restaurés automatiquement.

### Convertisseur de devises

- **Conversion bidirectionnelle** entre deux devises avec affichage en temps réel.
- **Grille de cartes** affichant les taux pour l'ensemble des devises supportées (170+).
- **Recherche/filtrage** dynamique par code ou nom de devise.
- **Drapeaux d'emoji** pour chaque devise, améliorant la lisibilité.
- **Combobox de sélection** avec recherche intégrée (composant Shadcn Command + Popover).
- **Persistance locale** de la dernière devise source, cible et montant.

## Architecture (vue d'ensemble)

```
gold-investment/
├── src/
│   ├── lib/
│   │   ├── components/          # Composants Svelte réutilisables
│   │   │   ├── ui/              # Composants Shadcn-Svelte (button, card, command, etc.)
│   │   │   ├── InvestmentChart.svelte    # Graphique projection investissement
│   │   │   ├── TimeSeriesChart.svelte    # Graphique historique 30 jours
│   │   │   ├── CurrenciesCombobox.svelte # Combobox de sélection de devise
│   │   │   ├── NavBar.svelte             # Navigation principale
│   │   │   └── Footer.svelte             # Pied de page
│   │   ├── model/               # Types et interfaces TypeScript
│   │   │   ├── Investment.ts              # Types du formulaire investissement
│   │   │   ├── CurrentMetalsPrice.ts      # Réponse API prix métaux
│   │   │   ├── MetalsTimeSeries.ts        # Réponse API séries temporelles
│   │   │   ├── CurrentCurrencies.ts       # Réponse API taux de change
│   │   │   └── currenciesFlag.ts          # Liste statique 170+ devises avec drapeaux
│   │   ├── server/              # Code exclusivement serveur
│   │   │   ├── MetalApi.ts                # Client API Metals.dev
│   │   │   └── Cache.ts                   # Cache fichier plat (expiration journalière)
│   │   ├── utils.ts             # Utilitaire cn() (clsx + tailwind-merge)
│   │   └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte       # Layout global (NavBar + Footer)
│   │   ├── +page.server.ts      # Load serveur : métaux + séries + devises → cache → API
│   │   ├── +page.svelte         # Page calculateur investissement
│   │   └── currencies/
│   │       ├── +layout.svelte   # ModeWatcher (thème clair/sombre)
│   │       ├── +page.server.ts  # Load serveur : devises → cache → API
│   │       └── +page.svelte     # Page convertisseur de devises
│   ├── app.css                  # Variables CSS Tailwind (thèmes clair/sombre)
│   ├── app.d.ts                 # Déclarations TypeScript globales
│   └── app.html                 # Template HTML racine
├── static/                      # Fichiers statiques (favicon, fond d'écran)
├── Dockerfile                   # Build Node.js + pnpm → production
├── docker-compose.yml           # Déploiement conteneurisé
└── .github/workflows/           # CI/CD : build Docker → push → deploy SSH
```

**Flux de données type** (page investissement) :

1. Le `+page.server.ts` tente de lire les données depuis le **cache fichier** (`Cache.ts`).
2. Si le cache est absent ou expiré (comparaison de date au jour près), un appel **Metals.dev API** est effectué via `MetalApi.ts`.
3. Si la réponse API est en `status: "success"`, le résultat est écrit dans le cache fichier.
4. Les données sont transmises au composant `+page.svelte` via les props de SvelteKit.
5. Les graphiques ECharts (`InvestmentChart`, `TimeSeriesChart`) se mettent à jour réactivement via `$effect()` à chaque modification d'un paramètre.

## Choix techniques et raisons

1. **SvelteKit 5 avec runes (`$state`, `$effect`, `$derived`, `$props`)** : utilisation de la toute dernière API réactive de Svelte 5. Chaque paramètre du formulaire est un état réactif qui déclenche le recalcul du graphique instantanément. C'est un choix audacieux et moderne qui démontre une maîtrise des runtimes les plus récents.

2. **Cache fichier plat côté serveur** : plutôt que d'introduire Redis ou une base de données, l'application utilise un simple fichier JSON dans `cache/` avec une expiration journalière. C'est pragmatique : les prix de l'or changent peu intra-journée, et l'API Metals.dev a des quotas limités. Cela supprime une dépendance infrastructure.

3. **Adapter Node.js** (`@sveltejs/adapter-node`) : le projet est conçu pour un déploiement sur serveur propre (VPS), pas sur du serverless. Cela permet le cache fichier local et simplifie le déploiement via Docker.

4. **ECharts plutôt que Chart.js** : choix d'une bibliothèque de visualisation plus puissante et personnalisable. Les tooltips HTML personnalisés, les animations (`cubicOut`) et le responsive via `ResizeObserver` sont directement exploités.

5. **Shadcn-Svelte** : approche « copy-paste component » qui permet de posséder le code UI plutôt que de dépendre d'un package externe. Le projet utilise les composants `button`, `card`, `command`, `dialog`, `input`, `label`, `popover`, `select`, `separator`, `switch` — une base solide et cohérente.

6. **CI/CD Docker + SSH** : pipeline GitHub Actions qui build l'image Docker, la pousse sur Docker Hub, puis déploie via SSH (`sshpass + docker compose pull/up`). Simple, efficace, sans orchestrateur lourd.

7. **TypeScript strict avec typage des réponses API** : chaque réponse de l'API Metals.dev est typée (`CurrentMetalsPrice`, `MetalsTimeSeries`, `CurrentCurrencies`), ce qui garantit la sécurité du code consommateur.

8. **Tailwind CSS avec variables CSS HSL** : le thème est entièrement piloté par des custom properties CSS (`--background`, `--primary`, etc.), permettant un changement de mode clair/sombre par simple toggle de classe `.dark`.

## Extraits de code remarquables

### 1. Client API Metals.dev — Encapsulation serveur propre

**Fichier** : `src/lib/server/MetalApi.ts`

```typescript
import type {CurrentMetalsPrice} from '$lib/model/CurrentMetalsPrice';
import { env } from '$env/dynamic/private';
import {format} from 'date-fns';
import type {MetalsTimeSeries} from "$lib/model/MetalsTimeSeries";
import type {CurrentCurrencies} from "$lib/model/CurrentCurrencies";
import 'dotenv/config';

const METALS_API_KEY = env.METALS_API_KEY || null;
if (!METALS_API_KEY) {
    console.error('METALS_API_KEY is not set');
}

const API_URL = "https://api.metals.dev/v1/";

export class MetalApi {

    public async getMetalTimeSeries(
        startDate: Date,
        endDate: Date,
    ): Promise<MetalsTimeSeries> {
        if (startDate > endDate) {
            throw new Error('Start date must be before end date');
        }
        if (endDate.getTime() - startDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
            throw new Error('Date range must be 30 days or less');
        }
        const formatted_start_date = format(startDate, 'yyyy-MM-dd');
        const formatted_end_date = format(endDate, 'yyyy-MM-dd');
        const url = `${API_URL}timeseries?api_key=${METALS_API_KEY}&start_date=${formatted_start_date}&end_date=${formatted_end_date}`
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });
        return await response.json()
    }

    public async getCurrentMetalPrice(): Promise<CurrentMetalsPrice> {
        return (await fetch(`${API_URL}latest?api_key=${METALS_API_KEY}&currency=USD&unit=g`, {
            headers: { 'Accept': 'application/json' },
        })).json();
    }

    public async getCurrentCurrencies(): Promise<CurrentCurrencies> {
        return (await fetch(`${API_URL}currencies?api_key=${METALS_API_KEY}&base=USD`, {
            headers: { 'Accept': 'application/json' },
        })).json();
    }
}

export const metalApi = new MetalApi()
```

**Pourquoi c'est intéressant** : le client API est isolé dans `$lib/server/`, ce qui garantit qu'il n'est jamais exposé côté client (SvelteKit exclut ce répertoire du bundle navigateur). La validation métier (dates, plage max 30 jours) est faite avant l'appel réseau, évitant des requêtes inutiles. Le singleton exporté (`metalApi`) assure une utilisation cohérente. La clé API est récupérée via `$env/dynamic/private`, le mécanisme natif de SvelteKit pour les variables d'environnement côté serveur.

---

### 2. Cache fichier avec expiration journalière

**Fichier** : `src/lib/server/Cache.ts`

```typescript
import type {MetalsTimeSeries} from "$lib/model/MetalsTimeSeries";
import { writeFile, readFile, access, mkdir } from 'fs/promises';
import path from 'path';
import {format} from "date-fns";
import type {CurrentMetalsPrice} from "$lib/model/CurrentMetalsPrice";
import type {CurrentCurrencies} from "$lib/model/CurrentCurrencies";

export class CacheApiResponse {

    public async getMetalsTimeSeries(): Promise<MetalsTimeSeries | null> {
        const now = new Date();
        const cacheDir = path.join(process.cwd(), 'cache');
        const cacheFile = path.join(cacheDir, `metals-time-series`);
        try {
            await access(cacheDir).catch(async () => {
                await mkdir(cacheDir, { recursive: true });
            });
            await access(cacheFile);
            const cached = await readFile(cacheFile, 'utf-8');
            const { data, date } = JSON.parse(cached);
            const parsed_date = format(new Date(date), 'yyyy-MM-dd');
            if (parsed_date === format(now, 'yyyy-MM-dd')) {
                return data as MetalsTimeSeries;
            }
        } catch {
            return null;
        }
        return null;
    }

    public async cacheMetalsTimeSeries(data: MetalsTimeSeries): Promise<void> {
        const now = new Date();
        const cacheDir = path.join(process.cwd(), 'cache');
        const cacheFile = path.join(cacheDir, `metals-time-series`);
        try {
            await access(cacheDir).catch(async () => {
                await mkdir(cacheDir, { recursive: true });
            });
            await writeFile(cacheFile, JSON.stringify({
                data: data,
                date: format(now, 'yyyy-MM-dd')
            }), 'utf-8');
        } catch {}
    }

    // ... méthodes identiques pour getCurrentMetalPrice et getCurrentCurrencies
}
export const cacheApiResponse = new CacheApiResponse()
```

**Pourquoi c'est intéressant** : le pattern « lecture cache → si absent/expiré → appel API → écriture cache » est simple et efficace. L'expiration est quotidienne (comparaison de date formatée), ce qui correspond à la granularité des données métalliques. Le répertoire de cache est créé à la volée si absent (`mkdir recursive`), ce qui rend le déploiement sans état initial possible. Le `cache/` est correctement exclus du dépôt Git (présent dans `.gitignore`).

---

### 3. Load serveur SvelteKit — Stratégie cache-first

**Fichier** : `src/routes/+page.server.ts`

```typescript
import type {PageServerLoad} from './$types';
import {metalApi} from "$lib/server/MetalApi";
import {cacheApiResponse} from "$lib/server/Cache";

export const load: PageServerLoad = async () => {

    let metalsTimeSeries = await cacheApiResponse.getMetalsTimeSeries();
    if (!metalsTimeSeries) {
        const now = new Date();
        const nowMinus30Days = new Date();
        nowMinus30Days.setDate(now.getDate() - 30);
        metalsTimeSeries = await metalApi.getMetalTimeSeries(nowMinus30Days, now);
        if (metalsTimeSeries.status === "success")
            await cacheApiResponse.cacheMetalsTimeSeries(metalsTimeSeries);
    }

    let currentMetalsPrice = await cacheApiResponse.getCurrentMetalPrice();
    if (!currentMetalsPrice) {
        currentMetalsPrice = await metalApi.getCurrentMetalPrice();
        if (currentMetalsPrice.status === "success")
            await cacheApiResponse.cacheCurrentMetalPrice(currentMetalsPrice);
    }

    let currentCurrencies = await cacheApiResponse.getCurrentCurrencies();
    if (!currentCurrencies) {
        currentCurrencies = await metalApi.getCurrentCurrencies();
        if (currentCurrencies.status === "success")
            await cacheApiResponse.cacheCurrentCurrencies(currentCurrencies);
    }

    return {
        metalsTimeSeries,
        currentMetalsPrice,
        currentCurrencies
    };
};
```

**Pourquoi c'est intéressant** : c'est l'illustration concrète du pattern cache-first côté serveur SvelteKit. Trois appels API potentiels sont tentés d'abord depuis le cache, et ne déclenchent une requête réseau qu'en cas de miss. La vérification du `status === "success"` avant la mise en cache évite de cacher une réponse erronée. Toute la logique d'acquisition de données est concentrée dans ce `load` serveur, le client ne reçoit que des données prêtes à consommer.

---

### 4. Calcul de projection d'investissement avec Zakat

**Fichier** : `src/lib/components/InvestmentChart.svelte` (extrait)

```typescript
function calculate() {
    let gold_g = data.start_invsetissement;
    const additional_invsetissement_ammount =
        data.additional_freq === "month" ? data.additional_invsetissement * 12 : data.additional_invsetissement;
    let additional_invsetissement = additional_invsetissement_ammount;

    estimations = [];
    additionals = [];
    golds = [];
    zekats = [];

    additionals.push(additional_invsetissement);
    estimations.push(+(gold_g * getGoldPrice(0)).toFixed(2) + additionals[0]);
    golds.push(gold_g + getAdditionalInvestment(0));
    if (data.zakat) {
        if (gold_g > 85) zekats.push(+(gold_g * 0.025 * current_metals_price.metals.gold).toFixed(2));
        else zekats.push(0);
    }

    for (let year = 1; year < data.invsetissement_duration; year++) {
        if (data.zakat) {
            if (gold_g > 85) zekats.push(+(gold_g * 0.025 * getGoldPrice(year + 1)).toFixed(2));
            else zekats.push(0);
        }
        gold_g += getAdditionalInvestment(year);
        golds.push(gold_g);
        additional_invsetissement += additional_invsetissement_ammount;

        if (data.remove_zakat_investment) {
            additional_invsetissement -= zekats[year];
        }

        additionals.push(additional_invsetissement);
        estimations.push(+(gold_g * getGoldPrice(year + 1) + additional_invsetissement_ammount).toFixed(2));
    }
}

function getGoldPrice(year: number): number {
    let start = current_metals_price.metals.gold / current_currencies.currencies[data.currency] * (data.karat / 24);
    for (let i = 1; i < year; i++) {
        start = start * (1 + (data.gold_return / 100));
    }
    return start;
}
```

**Pourquoi c'est intéressant** : le modèle de calcul est le cœur métier de l'application. Il projette le prix de l'or année par année en appliquant un taux de rendement composé, convertit dans la devise cible, et ajuste selon la pureté (carats/24). La prise en compte du **Zakat** (taxe de 2,5 % au-delà du seuil de 85 g d'or, conformément à la jurisprudence islamique) est une touche distinctive rare dans ce type d'outil. L'option `remove_zakat_investment` permet de simuler l'impact de cette taxe sur le capital investi.

---

### 5. Combobox de devises avec Shadcn-Svelte

**Fichier** : `src/lib/components/CurrenciesCombobox.svelte`

```svelte
<script lang="ts">
    import Check from "lucide-svelte/icons/check";
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
    import {tick} from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import {Button} from "$lib/components/ui/button/index.js";
    import {cn} from "$lib/utils.js";
    import type {CurrenciesFlagType} from "$lib/model/currenciesFlag";

    type Props = {
        currencies: CurrenciesFlagType[],
        value: CurrenciesFlagType,
    }

    let {currencies, value = $bindable()}: Props = $props();
    let open = $state(false);
    let _code = $state(value.code);
    let triggerRef = $state<HTMLButtonElement>(null!);

    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => { triggerRef.focus(); });
    }
</script>

<Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
        {#snippet child({props})}
            <Button variant="outline" class="flex px-2 border-none"
                    {...props} role="combobox" aria-expanded={open}>
                <div class="flex w-full justify-between overflow-hidden">
                    <span class="truncate w-[90%] text-lg">
                        {#if value}
                            {value.flag} {value.code} - {value.name}
                        {/if}
                    </span>
                    <ChevronsUpDown class="ml-2 flex w-10 size-4 shrink-0 opacity-50"/>
                </div>
            </Button>
        {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-full p-0">
        <Command.Root>
            <Command.Input placeholder="Search currencies..." class="p-2"/>
            <Command.List>
                <Command.Empty>No currencies found</Command.Empty>
                <Command.Group>
                    {#each currencies as currency (currency.code)}
                        <Command.Item
                            value={currency.name}
                            onSelect={() => {
                                _code = currency.code;
                                value = currency;
                                closeAndFocusTrigger();
                            }}>
                            <Check class={cn("mr-2 size-4", _code !== currency.code && "text-transparent")}/>
                            {currency.name}
                        </Command.Item>
                    {/each}
                </Command.Group>
            </Command.List>
        </Command.Root>
    </Popover.Content>
</Popover.Root>
```

**Pourquoi c'est intéressant** : ce composant est un bon exemple d'utilisation des primitives Shadcn-Svelte (`Command` + `Popover`) pour construire un combobox accessible et recherchable. La gestion du focus après sélection (`closeAndFocusTrigger`) via `tick()` est un pattern Svelte important pour la navigation clavier. L'utilisation de `{#snippet child({props})}` montre l'adoption des snippets Svelte 5 (remplacement des slots). La recherche intégrée dans le `Command.Input` filtre naturellement les 170+ devises.

---

### 6. Pipeline CI/CD — Docker build + déploiement SSH

**Fichier** : `.github/workflows/build-and-deploy.yml`

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          push: true
          tags: ${{vars.DOCKERHUB_USERNAME}}/gold-investment:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout project
        uses: actions/checkout@v4
      - name: Install sshpass
        run: sudo apt-get install sshpass
      - name: Deploy to server
        env:
          HOST: ${{ secrets.SERVER_HOST }}
          USER: ${{ secrets.SERVER_USER }}
          PASS: ${{ secrets.SERVER_PASS }}
          DEPOYMENT_PATH: ${{ secrets.DEPOYMENT_PATH }}
        run: |
          sshpass -p "$PASS" scp -o StrictHostKeyChecking=no docker-compose.yml $USER@$HOST:$DEPOYMENT_PATH
          sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $USER@$HOST << EOF
            cd $DEPOYMENT_PATH
            docker compose stop
            docker compose rm -f
            docker compose pull
            docker compose up -d
          EOF
```

**Pourquoi c'est intéressant** : le pipeline est scindé en deux jobs séquentiels (`needs: build`). Le premier construit l'image Docker et la pousse sur Docker Hub. Le second déploie sur un VPS distant via SSH : transfert du `docker-compose.yml`, puis arrêt, nettoyage, pull et redémarrage des conteneurs. C'est un pattern de déploiement simple mais complet, adapté à un projet de cette envergure sans nécessiter Kubernetes ou un PaaS.

---

### 7. Graphique de séries temporelles — Conversion troy → gramme

**Fichier** : `src/lib/components/TimeSeriesChart.svelte` (extrait clé)

```typescript
series: [
    {
        name: "Price",
        type: "line",
        data: Object.values(data.rates).map((rate) => (
            +((rate.metals.gold / 31.1034768) /
              current_currencies.currencies[chart_data.currency] *
              (chart_data.karat / 24)
            ).toFixed(2)
        )),
        smooth: true,
    },
],
animationEasing: 'cubicOut',
```

**Pourquoi c'est intéressant** : l'API Metals.dev retourne les prix en once troy (`troy ounce`), mais l'interface travaille en grammes. La constante `31.1034768` (grammes par once troy) est utilisée pour la conversion. Le prix est ensuite ajusté selon la devise et la pureté de l'or (`karat / 24`). Le résultat est un graphique lissé (`smooth: true`) avec une animation d'entrée `cubicOut`, produisant un rendu visuel soigné.

## Qualité, sécurité, maintenance

### Tests

Aucun test automatisé (unitaire ou d'intégration) n'est présent dans le dépôt. C'est une lacune notable pour un projet en production.

### Lint / Format

Le projet inclut `svelte-check` dans les scripts (`pnpm run check`), ce qui permet la vérification statique des types TypeScript dans les composants Svelte. Aucun linter (ESLint) ni formateur (Prettier) n'est configuré.

### CI/CD

Un pipeline GitHub Actions est en place pour le build et le déploiement automatique sur push vers `master`. Il est également déclenchable manuellement (`workflow_dispatch`). Les secrets sont correctement externalisés (Docker Hub, identifiants serveur SSH).

### Gestion d'erreurs

- Le client API (`MetalApi.ts`) valide les dates avant l'appel (ordre, plage max 30 jours).
- Le cache attrape silencieusement les erreurs (`catch {}`) — ce qui est acceptable pour un cache mais pourrait masquer des problèmes.
- Le `load` serveur vérifie `status === "success"` avant de mettre en cache, évitant de stocker des réponses erronées.
- Les erreurs de l'API ne sont pas propagées à l'utilisateur : en cas d'échec API et d'absence de cache, l'interface risque d'afficher des données incomplètes.

### Validation

Les champs du formulaire utilisent des `Input` de type `number` avec des attributs `step` et `min`/`max` basiques. Il n'y a pas de validation côté serveur des entrées utilisateur.

### Sécurité

- La clé API (`METALS_API_KEY`) est correctement stockée dans une variable d'environnement et n'est jamais exposée côté client (utilisation de `$env/dynamic/private` et isolation dans `$lib/server/`).
- Le fichier `.env` est exclu du dépôt via `.gitignore`.
- Le déploiement SSH utilise `StrictHostKeyChecking=no`, ce qui est un compromis pratique mais diminue la sécurité contre les attaques MITM.

### SEO

Chaque page inclut un bloc `<svelte:head>` avec des balises `title`, `meta description`, `meta keywords`, `og:title`, `og:description`, `og:url` et `og:type`. C'est un bon effort d'optimisation pour le référencement naturel.

## Installation et exécution (local)

### Prérequis

- **Node.js** (version courante, compatible avec l'image `node:current-alpine` du Dockerfile)
- **pnpm** (gestionnaire de paquets utilisé par le projet)
- Une **clé API Metals.dev** ([https://metals.dev/](https://metals.dev/))

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Sudo-Rahman/gold-investment.git
cd gold-investment

# 2. Installer les dépendances
pnpm install

# 3. Configurer la clé API
# Créer un fichier .env à la racine avec :
# METALS_API_KEY=votre_cle_api

# 4. Lancer le serveur de développement
pnpm run dev
```

### Autres commandes

```bash
pnpm run build       # Build de production (adapter Node)
pnpm run preview     # Prévisualisation du build
pnpm run check       # Vérification TypeScript/Svelte
```

### Déploiement Docker

```bash
# Build de l'image
docker build -t gold-investment .

# Exécution (avec .env contenant METALS_API_KEY)
docker compose up -d
```

L'application est exposée sur le port **3000** en interne, mappé vers **8080** dans le `docker-compose.yml`.

## Liens

- **GitHub** : [https://github.com/Sudo-Rahman/gold-investment](https://github.com/Sudo-Rahman/gold-investment)
- **Démo en ligne** : [https://gold-investment.sudo-rahman.fr/](https://gold-investment.sudo-rahman.fr/)
- **API utilisée** : [https://metals.dev/](https://metals.dev/)
