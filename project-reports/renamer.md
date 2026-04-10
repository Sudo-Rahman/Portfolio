# Renamer | Rapport technique

## En bref

- **Application de renommage de fichiers en masse**, multi-plateforme (Windows, macOS, Linux), avec un système de licences payantes.
- Frontend desktop construit avec **Tauri v2 + SvelteKit 5**, backend API en **Rust (Axum)**, site web commercial en **SvelteKit**.
- Architecture monorepo en trois modules : application desktop (`tauri-app/`), API (`renamer-api/`), site vitrine (`renamer-website/`), avec une crate partagée (`shared/`).
- Intégration complète du parcours commercial : paiement **Stripe**, activation de licence, webhook, emails transactionnels via **Mailgun**.
- ORM maison au-dessus de **MongoDB**, avec système de migrations automatiques et validation de schéma.
- Pipeline CI/CD complète : build multi-architecture (macOS Universal, Windows x86/ARM, Linux), Docker pour l'API et le site web, déploiement SSH automatisé.

## Contexte et objectif

Renamer est un outil utilitaire destiné aux professionnels et particuliers qui doivent renommer régulièrement de gros volumes de fichiers — photographes, monteurs vidéo, développeurs, administrateurs système. Le projet a été conçu dès l'origine comme un **produit commercial** : l'application desktop est distribuée gratuitement en version limitée (5 fichiers) et débloquée via l'achat d'une licence sur le site `renamer.pro`.

L'objectif est double : fournir une interface fluide et puissante pour le renommage en masse, et mettre en place une infrastructure complète de monétisation (paiement, gestion de licences par machine, emails transactionnels, auto-update).

## Fonctionnalités

- **Renommage en masse** de fichiers avec aperçu en temps réel avant application.
- **9 types de formateurs** (formatters) combinables et réordonnançables par drag-and-drop :
  - Numérotation séquentielle (démarrage, pas, remplissage zéro).
  - Changement de casse (lower, upper, title, camel, pascal, snake, kebab).
  - Insertion de texte libre.
  - Remplacement par expression régulière (avec ciblage de position).
  - Suppression de chaînes.
  - Formatage de date de création.
  - Formatage de taille de fichier (Byte, KB, MB, GB).
  - Changement d'extension.
  - Conservation du nom original.
- **Système de presets** : sauvegarde et chargement de configurations de formateurs, synchronisés côté serveur via la licence.
- **Gestion de licences** à deux plans : plan gratuit (1 machine, 5 fichiers max) et plan premium (5 machines, fichiers illimités).
- **Auto-update** intégré via `tauri-plugin-updater` avec fenêtre de progression de téléchargement.
- **Interface bilingue** (français / anglais) avec détection automatique de la locale système.
- **Validation en temps réel** des noms de fichiers (conflits, doublons, fichiers manquants).
- **Site web commercial** : page d'achat Stripe, page de confirmation, gestion des machines, mentions légales.

## Architecture (vue d'ensemble)

```
renamer/
├── tauri-app/                # Application desktop (Tauri v2 + SvelteKit)
│   ├── src/                  # Frontend SvelteKit (UI, modèles, composants)
│   │   ├── lib/components/   # Composants réutilisables (formatters, menus, dialogs)
│   │   ├── models/           # Modèles TypeScript (File, Formatter, Preset, Store)
│   │   └── routes/app/       # Pages SvelteKit (fenêtre principale, paramètres)
│   └── src-tauri/            # Backend Rust Tauri (commandes, API, store, windowing)
│       ├── src/
│       │   ├── main.rs       # Point d'entrée Tauri, enregistrement des commandes
│       │   ├── api.rs        # Communication avec l'API distante (licence, presets)
│       │   ├── utils.rs      # Opérations fichiers (list, rename, check)
│       │   ├── entities.rs   # Structures de données (RenameFile, FileRenameInfo)
│       │   ├── window.rs     # Création des fenêtres (main, update, terms)
│       │   ├── updater.rs    # Logique d'auto-update
│       │   ├── store.rs      # Store persistant (tauri-plugin-store)
│       │   └── app.rs        # État global de l'application
│       └── locales/          # Fichiers de traduction (en, fr)
├── renamer-api/              # API REST (Rust / Axum / MongoDB)
│   └── src/
│       ├── main.rs           # Serveur Axum, routes, middleware
│       ├── controllers.rs    # Handlers de routes (CRUD utilisateurs, licences)
│       ├── models.rs         # Modèles métier (User, Log) avec traits ORM
│       ├── orm/              # ORM maison (connection, traits, migrations, errors)
│       ├── api_rate.rs       # Rate limiting par IP (DashMap)
│       ├── mailgun.rs        # Envoi d'emails transactionnels
│       ├── log_layer.rs      # Middleware de logging requête/réponse
│       └── templates/        # Templates HTML pour les emails
├── renamer-website/          # Site web commercial (SvelteKit + Stripe)
│   └── src/
│       ├── routes/
│       │   ├── api/purchase/       # Création de session Stripe Checkout
│       │   └── api/webhook/success/ # Webhook Stripe → création utilisateur API
│       └── lib/server/Stripe.ts    # Singleton Stripe côté serveur
├── shared/                   # Crate partagée Rust/TypeScript
│   ├── src/lib.rs            # Structs UserMachine, Machine (Serde)
│   └── bindings/             # Types TypeScript générés par ts-rs
└── .github/workflows/        # CI/CD (publish, API deploy, website deploy)
```

**Flux de données principal :**

1. L'utilisateur importe des fichiers dans l'app desktop → le backend Rust (`utils.rs`) lit les métadonnées du filesystem.
2. L'utilisateur configure des formatters TypeScript → chaque formatter applique une transformation au nom de fichier.
3. L'aperçu est recalculé en temps réel ; un debounce déclenche la validation côté Rust (`check_files_names`) pour détecter les conflits.
4. Au renommage, l'app appelle `rename_files` qui exécute `std::fs::rename` pour chaque fichier et retourne le statut.
5. Pour les licences, l'app communique avec l'API Axum, qui interroge MongoDB via l'ORM maison.

**Flux commercial :**

1. L'utilisateur achète sur le site → Stripe Checkout Session → Webhook `checkout.session.completed`.
2. Le webhook crée l'utilisateur dans l'API, génère une clé UUID, envoie un email de confirmation via Mailgun.
3. L'utilisateur active sa licence dans l'app desktop → l'API associe la machine (identifiée par `mid` + `whoami`).

## Choix techniques et raisons

### 1. Tauri v2 plutôt qu'Electron

Tauri produit des binaires natifs significativement plus légers (~10 Mo vs ~150 Mo pour Electron). Le backend Rust permet les opérations filesystem directement en code natif, sans bridge IPC coûteux pour les opérations lourdes. Le support multi-plateforme inclut macOS (Universal Binary), Windows (x86 + ARM) et Linux.

### 2. Crate `shared` avec génération automatique de types TypeScript

Les structures `UserMachine` et `Machine` sont définies une seule fois en Rust dans la crate `shared/`, et la bibliothèque `ts-rs` génère automatiquement les interfaces TypeScript correspondantes dans `shared/bindings/`. Cela garantit la cohérence des types entre l'API Rust, le backend Tauri et le frontend, sans duplication manuelle.

### 3. ORM maison MongoDB avec migrations

Plutôt que d'utiliser un ORM existant, le projet implémente un mini-ORM dans `renamer-api/src/orm/` avec les traits `Model`, `Collection` et `HasBaseModel`. Ce choix permet :
- Un contrôle fin sur les opérations CRUD et les filtres MongoDB.
- Un système de migrations automatique qui détecte les champs manquants (premier niveau, imbriqués, tableaux) et les ajoute avec des valeurs par défaut.
- Un runner de migrations (`MigrationRunner`) avec versionnage et rollback.

### 4. Rate limiting concurrent avec DashMap

Le middleware de rate limiting (`api_rate.rs`) utilise `DashMap`, une hashmap concurrente lock-free, pour suivre les requêtes par IP sans contention. La limite est configurable (32 requêtes/60 secondes par défaut), et les adresses loopback sont exemptées.

### 5. Pipeline pattern pour les formatters

Les formatters TypeScript suivent le pattern **Chain of Responsibility** : chaque formatter implémente une méthode `format(file)` qui modifie le `newName` du fichier en séquence. Ce design permet la combinaison libre, la réorganisation par drag-and-drop, et l'ajout de nouveaux formateurs sans modifier le code existant.

### 6. Conteneurisation from scratch pour l'API

Le `api.Dockerfile` utilise un build multi-stage qui compile statiquement l'API Rust pour `x86_64-unknown-linux-musl`, puis copie le binaire dans une image `FROM scratch`. Le résultat est une image Docker minimale contenant uniquement le binaire et les certificats SSL — aucune couche OS superflue.

### 7. CI/CD multi-architecture complète

Trois workflows GitHub Actions couvrent l'ensemble du cycle de release :
- **publish.yml** : build macOS Universal (signé Apple Developer), Windows x86/ARM (MSI + NSIS), Linux (AppImage + DEB + RPM), création automatique d'une GitHub Release.
- **api_build_and_deploy.yml** / **website_build_and_deploy.yml** : build Docker, push sur registre privé, déploiement SSH avec `docker-compose`.

### 8. Licence AGPL v3

Le code source est ouvert sous licence AGPL v3, ce qui impose la publication du code source pour toute utilisation en service réseau — un choix cohérent avec la nature commerciale du produit.

## Extraits de code remarquables

### Extrait 1 — Pipeline de formatters TypeScript (pattern Chain of Responsibility)

**Fichier :** `tauri-app/src/models/Formatter.ts` (extrait)

```typescript
export abstract class Formatter {
    id: string;
    type: string;

    protected constructor() {
        this.id = uuidv4();
        this.type = (this.constructor as any).type;
    }

    static fromObject(obj: any): Formatter {
        let formatter: Formatter;
        switch (obj.type) {
            case 'NumberFormatter': formatter = new NumberFormatter(); break;
            case 'ExtensionFormatter': formatter = new ExtensionFormatter(); break;
            case 'CasesFormatter': formatter = new CasesFormatter(); break;
            case 'RegexFormatter': formatter = new RegexFormatter(); break;
            // ... autres types
            default: throw new Error(`Unknown formatter type: ${obj.type}`);
        }
        Object.assign(formatter, obj);
        return formatter;
    }

    abstract format(file: RenamerFile): void;
    finish(): void {}
}

export class NumberFormatter extends Formatter {
    static readonly type = "NumberFormatter";
    private _start: number;
    private _startTmp: number;
    private _step: number = 1;
    private _fill: { length: number, char: string } = { length: 0, char: "0" };

    constructor() {
        super();
        this._start = 1;
        this._startTmp = 1;
    }

    override finish(): void { this._start = this._startTmp; }

    format(file: RenamerFile): void {
        let formatted: string;
        if (this.text.length > 0) {
            formatted = `${this._text.replace("{%}",
                this.start.toString().padStart(this._fill.length, this._fill.char))}`;
        } else {
            formatted = this.start.toString().padStart(this._fill.length, this._fill.char);
        }
        this._start = +this._start + +this._step;
        file.newName += formatted;
    }
}
```

**Pourquoi c'est intéressant :** Le pattern `abstract class Formatter` avec `static fromObject` constitue une factory polymorphique propre. La méthode `finish()` réinitialise le compteur après chaque passe complète — crucial pour que la numérotation soit cohérente à chaque recalcul de l'aperçu. L'utilisation de `Object.assign` après instanciation permet la désérialisation sélective depuis le store JSON.

---

### Extrait 2 — ORM maison : trait Model avec CRUD générique et migrations

**Fichier :** `renamer-api/src/orm/traits.rs` (extrait)

```rust
#[async_trait]
pub trait Model: Serialize + for<'de> Deserialize<'de> + Send + Sync + Unpin + Clone + HasBaseModel {
    fn collection_name() -> &'static str;
    fn default_values() -> HashMap<String, mongodb::bson::Bson>;
    fn required_fields() -> Vec<String>;

    async fn save(&mut self, db: &Database) -> Result<()> {
        let collection = db.collection::<Self>(Self::collection_name());
        if self.id().is_none() {
            let result = collection.insert_one(self.clone()).await?;
            if let Some(id) = result.inserted_id.as_object_id() {
                self.set_id(id);
            }
        } else {
            let filter = doc! { "_id": self.id().unwrap() };
            collection.replace_one(filter, self).await?;
        }
        Ok(())
    }

    async fn migrate_missing_fields(db: &Database) -> Result<usize> {
        let collection = db.collection::<Self>(Self::collection_name());
        let defaults = Self::default_values();
        let mut total_updated = 0;
        for (field_name, default_value) in defaults {
            let filter = doc! { field_name.clone(): { "$exists": false } };
            let update = doc! { "$set": { field_name.clone(): default_value } };
            let result = collection.update_many(filter, update).await?;
            total_updated += result.modified_count;
        }
        Ok(total_updated as usize)
    }
}
```

**Pourquoi c'est intéressant :** Le trait `Model` encapsule le cycle save-or-update (upsert) de façon totalement générique. La méthode `migrate_missing_fields` utilise la projection `$exists: false` de MongoDB pour ajouter uniquement les champs absents — une approche idempotente qui permet de faire évoluer le schéma sans risque. Le projet étend ce principe aux champs imbriqués et aux éléments de tableaux via des pipelines d'agrégation MongoDB (`$map`, `$mergeObjects`).

---

### Extrait 3 — Rate limiting concurrent avec DashMap

**Fichier :** `renamer-api/src/api_rate.rs`

```rust
#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<DashMap<String, (Instant, u32)>>,
    limit: u32,
    window: Duration,
}

impl RateLimiter {
    pub fn new(limit: u32, window: Duration) -> Self {
        Self {
            requests: Arc::new(DashMap::new()),
            limit, window,
        }
    }

    fn check(&self, ip: &str) -> Result<(), StatusCode> {
        let mut entry = self.requests.entry(ip.to_string())
            .or_insert((Instant::now(), 0));
        let (start_time, count) = entry.value_mut();

        if start_time.elapsed() > self.window {
            *start_time = Instant::now();
            *count = 0;
        }
        if *count >= self.limit {
            return Err(StatusCode::TOO_MANY_REQUESTS);
        }
        *count += 1;
        Ok(())
    }
}

pub async fn rate_limit_middleware(
    request: Request, next: Next, rate_limiter: Arc<RateLimiter>,
) -> Result<Response, StatusCode> {
    let ip = request.headers()
        .get("X-Forwarded-For")
        .or_else(|| request.headers().get("X-Real-IP"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");

    let is_loopback = match ip.parse::<IpAddr>() {
        Ok(IpAddr::V4(ipv4)) => ipv4.is_loopback(),
        Ok(IpAddr::V6(ipv6)) => ipv6.is_loopback(),
        Err(_) => false,
    };

    if !is_loopback { rate_limiter.check(ip)?; }
    Ok(next.run(request).await)
}
```

**Pourquoi c'est intéressant :** L'utilisation de `DashMap` offre une hashmap concurrente sans verrou global — chaque bucket a son propre RwLock, minimisant la contention sous charge. La logique de sliding window est simple mais efficace : reset du compteur quand la fenêtre expire. L'exemption des adresses loopback facilite le développement local et le monitoring interne.

---

### Extrait 4 — Webhook Stripe : pont entre paiement et création de licence

**Fichier :** `renamer-website/src/routes/api/webhook/success/+server.ts`

```typescript
export const POST: RequestHandler = async ({request}) => {
    const sig = request.headers.get('stripe-signature')!;
    let event;

    try {
        const body = await request.text();
        event = getStripe().webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, {status: 400});
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        if (session.customer_details && session.customer_details.email) {
            let plan = 1;
            try {
                const product = await getStripe().products.retrieve(session.metadata.product);
                plan = +product.metadata.plan || 1;
            } catch (err: any) {
                console.error(`Erreur produit: ${err.message}`);
            }

            const invoice = await getStripe().invoices.retrieve(session.invoice);

            await fetch(env.API_URL + "/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: session.customer_details.email,
                    plan: plan,
                    token: env.AUTHENTICATION_KEY,
                    payment_intent: session.payment_intent,
                    invoice_url: invoice.hosted_invoice_url,
                }),
            });
        }
    }

    return new Response(JSON.stringify({received: true}), {status: 200});
};
```

**Pourquoi c'est intéressant :** Ce handler illustre l'architecture événementielle du parcours d'achat. La vérification de signature Stripe (`constructEvent`) est essentielle pour la sécurité — elle garantit que la requête provient bien de Stripe. Le handler récupère le plan depuis les metadata du produit Stripe, ce qui permet de définir le plan tarifaire directement dans le dashboard Stripe sans modification de code.

---

### Extrait 5 — Construction d'image Docker from scratch

**Fichier :** `api.Dockerfile`

```dockerfile
FROM rust:bullseye AS builder
RUN apt-get update && apt-get install -y libssl-dev musl pkg-config musl-tools \
    build-essential musl-dev && rustup target add x86_64-unknown-linux-musl

WORKDIR /api/renamer-api
COPY ./renamer-api /api/renamer-api
COPY ./shared /api/shared
RUN cargo build --release --target x86_64-unknown-linux-musl

FROM scratch AS final
EXPOSE 3000
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /etc/ssl/certs/ /usr/local/ssl/certs/
COPY --from=builder /api/renamer-api/target/x86_64-unknown-linux-musl/release/renamer-api \
     /usr/local/bin/renamer-api
CMD ["/usr/local/bin/renamer-api"]
```

**Pourquoi c'est intéressant :** L'image finale est `FROM scratch` — elle ne contient littéralement rien d'autre que le binaire statiquement lié et les certificats SSL. C'est l'approche la plus minimaliste possible en Docker, réduisant la surface d'attaque à néant et produisant une image de quelques mégaoctets. La compilation MUSL garantit la portabilité statique sans dépendance glibc.

---

### Extrait 6 — Système de fenêtres multi-contextes dans Tauri

**Fichier :** `tauri-app/src-tauri/src/window.rs`

```rust
pub fn create_main_window(app: tauri::AppHandle) {
    let mut builder = tauri::WebviewWindowBuilder::new
        (&app, "main", tauri::WebviewUrl::App("app".into()))
        .title("Renamer")
        .inner_size(1200.0, 600.0)
        .min_inner_size(1000.0, 600.0)
        .center();

    #[cfg(target_os = "macos")]
    { builder = builder.title_bar_style(tauri::TitleBarStyle::Overlay).shadow(true); }

    #[cfg(any(target_os = "windows", target_os = "linux"))]
    { builder = builder.decorations(false).transparent(true).shadow(true); }

    builder.build().unwrap();
}

pub fn create_terms_window(app: tauri::AppHandle){
    let handle_for_update = app.clone();
    app.clone().once("terms_accepted", move |_| {
        tauri::async_runtime::spawn(async move {
            check_update(handle_for_update.clone(), || {
                create_main_window(handle_for_update.clone());
            }).await.inspect_err(|_| {
                create_main_window(handle_for_update.clone());
            }).expect("error checking update");
            handle_for_update.get_webview_window("terms").unwrap().close().unwrap();
            AppStore::write("terms_accepted", Value::Bool(true));
        });
    });

    tauri::WebviewWindowBuilder::new(&app, "terms", tauri::WebviewUrl::App("terms".into()))
        .title("Terms").shadow(true).decorations(false).transparent(true)
        .inner_size(800.0, 600.0).center().build().unwrap();
}
```

**Pourquoi c'est intéressant :** L'application gère trois fenêtres distinctes (terms, main, update) avec des configurations par OS. Sur macOS, `TitleBarStyle::Overlay` donne l'apparence native avec barre de titre intégrée ; sur Windows/Linux, `decorations(false)` + `transparent(true)` permet une titlebar entièrement personnalisée. Le pattern `once("terms_accepted")` montre un mécanisme événementiel pour la navigation entre fenêtres : la fenêtre principale ne s'ouvre qu'après acceptation des CGU.

---

### Extrait 7 — Modèles métier avec validation de plan de licence

**Fichier :** `renamer-api/src/models.rs` (extrait)

```rust
impl User {
    pub fn add_machine(&mut self, machine: Machine) -> Result<(), String> {
        match self.plan {
            0 => {
                if !self.machines.is_empty() {
                    return Err("User already has a machine".to_string());
                }
            }
            1 => {
                if self.machines.len() >= 5 {
                    return Err("User already has 5 machines".to_string());
                }
                if self.has_machine(&machine.id) {
                    return Err("Machine already exists".to_string());
                }
            }
            _ => return Err("Invalid plan".to_string()),
        }
        self.machines.push(machine);
        self.touch();
        Ok(())
    }

    pub fn remove_machine(&mut self, machine_id: &str) -> Result<(), String> {
        if !self.has_machine(machine_id) {
            return Err("Machine not found".to_string());
        }
        self.machines.retain(|m| m.id != machine_id);
        self.touch();
        Ok(())
    }
}

pub fn user_to_user_machine(user: User, machine: Machine) -> UserMachine {
    UserMachine {
        email: user.email,
        key: user.key,
        machine,
        plan: user.plan,
        presets: user.presets,
    }
}
```

**Pourquoi c'est intéressant :** La logique métier de gestion des plans est encapsulée directement dans le modèle `User`. La méthode `touch()` (héritée de `HasBaseModel`) met à jour automatiquement `updated_at` à chaque mutation — un pattern simple mais efficace pour le suivi de modifications. La fonction `user_to_user_machine` effectue la projection vers le type partagé, ne renvoyant que la machine demandée et non la liste complète — un choix de sécurité qui limite l'exposition des données.

## Qualité, sécurité, maintenance

### Tests
Le projet contient un squelette de test dans `renamer-api/src/main.rs` mais n'a pas de suite de tests automatisés complète. C'est un point d'amélioration identifié.

### Lint et formatage
Pas de configuration ESLint, Prettier ou clippy visible dans le dépôt. Le code TypeScript et Rust suit des conventions cohérentes mais sans enforcement automatisé.

### CI/CD
Trois workflows GitHub Actions couvrent le cycle de vie complet :
- **publish.yml** : build et release multi-plateforme sur tag `v*.*.*`.
- **api_build_and_deploy.yml** : build Docker de l'API + déploiement SSH.
- **website_build_and_deploy.yml** : build Docker du site web + déploiement SSH.

Le caching des dépendances Rust (`actions/cache`) et des packages système accélère les builds.

### Gestion d'erreurs
- L'API Rust utilise des `Result<T, (StatusCode, String)>` pour toutes les routes, avec des messages d'erreur explicites en debug et génériques en production (`cfg!(debug_assertions)`).
- L'ORM définit un type `OrmError` dédié avec conversion automatique depuis les erreurs MongoDB.
- Les erreurs d'envoi d'email Mailgun sont loggées en base de données plutôt que de faire échouer la requête principale.

### Validation des entrées
La fonction helper `extract_field<T>` dans `controllers.rs` fournit une désérialisation typée et validée des corps JSON avec des messages d'erreur contextuels.

### Sécurité
- CORS restrictif en production (origine `https://renamer.pro` uniquement), permissif uniquement en debug.
- Rate limiting par IP sur toutes les routes.
- Token d'authentification (`AUTHENTICATION_KEY`) pour les routes sensibles (création d'utilisateur).
- Vérification de signature Stripe sur les webhooks.
- L'API de gestion des logs (`/logs`) est restreinte aux requêtes loopback.
- Les secrets sont injectés via des variables d'environnement et des GitHub Secrets.

### Logging
Un middleware Axum (`log_layer.rs`) intercepte toutes les requêtes et réponses pour les logger avec le body complet — utile en développement. En production, `tracing_subscriber` fournit un logging structuré.

## Installation et exécution (local)

### Prérequis
- **Rust** (édition 2021+), **Node.js** 22+, **pnpm** 10
- **MongoDB** (local ou distant)
- Comptes **Stripe** (test keys) et **Mailgun** (optionnel, pour les emails)

### Application desktop (Tauri)

```bash
cd tauri-app
pnpm install
pnpm tauri dev          # Développement avec hot-reload
pnpm tauri build        # Build de production
```

### API

```bash
cd renamer-api
# Configurer le fichier .env avec MONGO_URI, AUTHENTICATION_KEY, MAILGUN_API_KEY_DEV
cargo run               # Démarre sur le port 3000
cargo run --bin migrate # Exécute les migrations automatiques
```

### Site web

```bash
cd renamer-website
pnpm install
# Configurer le fichier .env avec STRIPE_KEY, STRIPE_WEBHOOK_SECRET, PRICE_ID_PLAN_1, etc.
pnpm dev                # Développement sur le port 5173
pnpm build              # Build de production
```

### Docker (déploiement)

```bash
# API
docker build -t renamer-api -f api.Dockerfile .
# Site web
docker build -t renamer-website -f renamer-website/Dockerfile renamer-website/
# Via docker-compose
docker-compose up -d
```

## Limites connues et pistes d'amélioration

- **Absence de tests automatisés** : aucun test unitaire ou d'intégration substantiel. L'ajout de tests sur l'ORM, les contrôleurs et les formatters serait le premier investissement qualité.
- **Rate limiter basique** : l'implémentation actuelle utilise un compteur par fenêtre fixe, qui ne gère pas le burst. Un algorithme de token bucket ou sliding window log serait plus précis.
- **Pas de base de données transactionnelle** : MongoDB est utilisé en standalone, sans replica set. Pour un usage futur avec plus de données, un replica set avec transactions serait recommandé.
- **Log middleware trop verbeux** : le logging complet des bodies en production peut poser des problèmes de performance et de confidentialité (PII dans les requêtes). Un filtrage par route ou par niveau serait nécessaire.
- **Gestion d'erreurs TypeScript** : certains endroits utilisent des `unwrap()` ou des conversions forcées (`as_str().unwrap()`) qui pourraient paniquer. Un renforcement de la gestion d'erreurs côté Rust améliorerait la robustesse.
- **Support Linux ARM** : le pipeline CI ne build que pour `x86_64-unknown-linux-gnu`. L'ajout d'un build ARM étendrait le support aux Raspberry Pi et serveurs ARM.
- **Accessibilité (a11y)** : aucune mention d'accessibilité dans les composants Svelte — un audit et l'ajout d'attributs ARIA seraient bénéfiques.

## Liens

- **Dépôt local :** `/Users/sr-71/Documents/portfolio/repos_to_process/renamer`
- **Site de production :** `https://renamer.pro`
- **API de production :** `https://api.renamer.pro`
- **Licence :** GNU Affero General Public License v3 (AGPL-3.0)
