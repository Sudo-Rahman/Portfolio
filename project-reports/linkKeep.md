# LinkKeep | Rapport technique

## En bref

- **Application native Apple** (iOS, iPadOS, macOS) de gestion et d'organisation de liens/bookmarks, accompagnee d'un site web marketing multilingue.
- Fonctionnalites cles : categories, dossiers, signets avec notes, rappels, controle de sante des liens, verrouillage biometrique, synchronisation iCloud, export/import, extension de partage.
- Stack applicatif : **Swift 6.2 / SwiftUI** avec un package partage `LinkKeepCore` (Domain, Data, Services, SharedUI), persistence Core Data + CloudKit.
- Stack web : **SvelteKit 2 / Svelte 5 runes / TypeScript strict / Tailwind CSS v4 / Paraglide** (i18n en 9 langues), deploiement Node.js via Docker.
- Architecture en couches propres (Domain/Data/Services) avec inversion de dependance via protocoles, code agnostique de plateforme, et model Core Data construit programmatiquement.

## Contexte et objectif

LinkKeep est un gestionnaire de liens destine aux utilisateurs Apple qui souhaitent sauvegarder, organiser et retrouver efficacement les URLs qu'ils rencontrent au quotidien. Contrairement aux favoris de navigateur, LinkKeep propose une experience dediee avec categorisation hierarchique (categories > dossiers > signets), suivi de sante des liens, rappels temporels, verrouillage biometrique de categories sensibles, et synchronisation iCloud entre tous les appareils.

Le monorepo contient deux codebases distinctes :

1. **`application/`** — les apps natives iOS et macOS plus le package Swift partage `LinkKeepCore`.
2. **`website/`** — le site marketing/support construit avec SvelteKit, deploye dans un container Docker Node.js.

Le projet cible iOS 26+ et macOS 26+, est disponible sur l'App Store (ID `6760005462`), et propose un modele freemium (gratuit : 1 categorie, 10 signets ; Pro : illimite).

## Fonctionnalites

### Application (iOS / iPadOS / macOS)

- **Categories** : conteneurs de premier niveau avec icone, couleur d'accent, et option de verrouillage biometrique. La categorie « Favorites » est protegee et non supprimable.
- **Groupes (dossiers)** : sous-conteneurs optionnels a l'interieur d'une categorie. La suppression d'un groupe re-parente ses signets dans la categorie.
- **Signets (bookmarks)** : URL, titre, domaine extrait automatiquement, note personnelle, epinglage, archivage, compteur de visites.
- **Extension de partage iOS** : ajout rapide de liens depuis n'importe quelle application via la share sheet du systeme.
- **Sante des liens** : verification HTTP automatique/manuelle avec classification alive/dead/unverifiable, throttling par domaine, backoff en cas d'echec, rapport de synthese.
- **Rappels** : planification de notifications locales pour revoir un lien a une date donnee, avec reconciliation automatique au lancement.
- **Securite** : categories protegees par Face ID / Touch ID via `LocalAuthentication`, avec etat `locked/unlocking/unlocked/failed`.
- **Synchronisation iCloud** via `NSPersistentCloudKitContainer`.
- **Export/Import** : format `.linkkeep` (JSON ISO 8601) avec round-trip complet categories/groupes/signets.
- **Quota** : limites par plan (Free : 1 categorie, 10 signets ; Pro : illimite) avec `QuotaError` specifiques.
- **Capture d'ecran web** : service de screenshot via `WKWebView` hors ecran avec cache a deux niveaux (memoire + disque).
- **Presse-papiers** : detection et suggestion automatique d'URLs copiees.
- **Apercu web** : visionneuse inline pour consulter un lien sans quitter l'application.

### Site web (marketing)

- Page d'accueil avec hero, presentation des plateformes, grille de fonctionnalites, captures d'ecran, FAQ, et footer.
- Pages legales (mentions legales, confidentialite, termes), support, et page de licences.
- SEO technique : balises meta Open Graph, Twitter Cards, JSON-LD (`SoftwareApplication`), hreflang alternates pour 9 locales.
- Internationalisation Paraglide en 9 langues : anglais, allemand, espagnol, francais, italien, japonais, coreen, portugais breilien, chinois simplifie.
- Mode sombre via `mode-watcher`.
- Deploiement Docker (multi-stage Alpine, port 3000).

## Architecture (vue d'ensemble)

### Monorepo

```
linkKeep/
├── application/
│   ├── LinkKeep-IOS/                 # App iOS + share extension
│   │   ├── LinkKeep/
│   │   │   ├── App/                  # Point d'entree iOS
│   │   │   ├── Features/             # Ecrans : Home, CategoryDetail, GroupDetail,
│   │   │   │                         #   LinkHealth, Settings, Paywall, WebViewer, etc.
│   │   │   ├── Platform/             # Adaptateurs plateforme (haptics, URL opener, WebView)
│   │   │   └── Resources/            # Localisations (9 langues)
│   │   └── share/                    # Share Extension (ViewModel, View)
│   ├── LinkKeep-MacOS/
│   │   └── LinkKeep/
│   │       ├── App/                  # Point d'entree macOS
│   │       ├── Features/             # Ecrans equivalents + Browser natif
│   │       ├── Platform/             # Adaptateurs macOS
│   │       └── Shell/                # Integration macOS specifique
│   ├── LinkKeep.xcworkspace/         # Workspace reunissant les deux projets
│   └── Packages/LinkKeepCore/        # Package Swift partage (SPM)
│       ├── Sources/
│       │   ├── Domain/               # Entites, protocoles, value types, services purs
│       │   ├── Data/                 # Core Data, repositories, mappers
│       │   ├── Services/             # Logique metier : Health, Reminder, Export, Security...
│       │   └── SharedUI/             # Design system et composants SwiftUI reutilisables
│       └── Tests/
│           ├── DomainTests/          # QuotaService, FavoritesGuard, ExportPayload
│           ├── DataTests/            # Tests du persistence layer
│           ├── ServicesTests/        # BookmarkReminderCoordinator
│           └── SharedUITests/
└── website/
    ├── src/
    │   ├── routes/                   # Pages SvelteKit (+page.svelte, +page.server.ts)
    │   ├── lib/
    │   │   ├── components/
    │   │   │   ├── landing/          # Sections de la landing page
    │   │   │   ├── ui/               # 56 composants shadcn-svelte
    │   │   │   └── i18n/             # Composants d'internationalisation
    │   │   ├── seo/                  # SeoHead (meta, OG, hreflang)
    │   │   ├── hooks/                # Hooks reactifs (is-mobile)
    │   │   ├── server/               # Utilitaires serveur (public URL)
    │   │   └── i18n/                 # Configuration Paraglide
    │   ├── hooks.server.ts           # Middleware i18n Paraglide
    │   └── hooks.ts                  # Reroute client (strip locale)
    └── messages/                     # 9 dictionnaires de traduction JSON
```

### Package Swift `LinkKeepCore` — separation en couches

Le package est organise en quatre modules avec dependances unidirectionnelles :

```
SharedUI ──> Domain
Services ──> Domain, Data
Data ──> Domain
Domain (aucune dependance interne)
```

- **Domain** : types valeurs purs (`Bookmark`, `Category`, `Group`, `PlanEntitlement`), protocoles de repository (`BookmarkRepository`, `CategoryRepository`, `GroupRepository`), enums de validation (`ValidationError`, `LinkHealthStatus`), services stateless (`QuotaService`, `URLNormalizer`, `FavoritesGuard`). Aucune dependance framework hormis Foundation.
- **Data** : implementations Core Data des protocoles Domain. `PersistenceController` gere le stack SQLite + CloudKit avec fallback in-memory. `CoreDataModelBuilder` construit le model programmatiquement comme fallback SPM. Les mappers assurent la conversion bi-directionnelle entre `NSManagedObject` et types Domain.
- **Services** : orchestration metier : `LinkHealthService` (batch concurrent par domaine avec backoff), `BookmarkReminderCoordinator` (persistance + notification), `ExportService`/`ImportService`, `HiddenCategoryAccessController` (biometrie), `ClipboardService`, `WebPageCaptureService`, `SubscriptionService`.
- **SharedUI** : design system (theme, couleurs, typographie, metriques) et composants SwiftUI reutilisables (cartes, badges, pickers, empty states, live link preview).

### Regle critique d'agnosticisme de plateforme

Le code applicatif doit rester agnostique de plateforme. Les compilations conditionnelles (`#if os(macOS)`, `#if os(iOS)`) sont interdites dans les cibles et modules partages. Le comportement specifique est injecte via protocoles definis dans `LinkKeepCore` et implementes dans les dossiers `Platform/` de chaque app.

## Choix techniques et raisons

1. **Swift 6.2 avec concurrence stricte** : le package cible Swift Tools Version 6.2, exploitant `Sendable`, `@MainActor`, et les checked exceptions pour eliminer les data races a la compilation. Les types Domain sont tous `Sendable`, les repositories sont declares `@unchecked Sendable` avec encapsulation correcte du contexte Core Data.

2. **Model Core Data programmatique** : `CoreDataModelBuilder` construit l'integralite du schema en code Swift plutot que de dependre uniquement du `.xcdatamodeld`. Cela contourne une limitation de SPM qui ne compile pas les modeles Core Data pour les cibles de test macOS, tout en fonctionnant normalement via Xcode pour les builds d'app.

3. **Inversion de dependance via protocoles** : les repositories sont definis comme protocoles dans Domain et implementes dans Data. Les services (rappels, sante, securite) dependent d'abstractions injectables, ce qui permet les tests unitaires avec des fakes locaux sans framework de mock.

4. **LinkHealthService : verification HTTP avec throttling par domaine** : le service regroupe les URLs par domaine, limite la concurrence a 4 domaines simultanes, ajoute un jitter de 1.5-4 secondes entre les requetes d'un meme domaine, et implemente un backoff de 12 heures via un actor dedie avec persistence sur disque (fichiers JSON hashes en SHA-256). La resolution est conservative : HEAD d'abord, GET en fallback, avec classification des erreurs URLError en `dead`/`unverifiable`/`offline`.

5. **Freemium avec quota enforce dans le repository** : `CoreDataBookmarkRepository.create(_:entitlement:)` verifie le quota avant la creation, lancant un `QuotaError.bookmarkLimitReached`. Les limites sont encapsulees dans `PlanEntitlement` avec des presets statics (`free`, `pro`).

6. **SvelteKit 2 + Svelte 5 runes exclusivement** : le site web utilise les runes (`$state`, `$derived`, `$effect`, `$props`) et les snippets (`{@render children?.()}`), sans aucun recours aux stores legacy ou a `createEventDispatcher`. TypeScript strict mode avec `moduleResolution: "bundler"` impose les extensions `.js` dans les imports relatifs.

7. **i18n compilee via Paraglide** : les messages sont definis dans des fichiers JSON (`messages/en.json`, `messages/fr.json`, etc.) et compiles en fonctions TypeScript typees dans `$lib/paraglide/messages.js`. Le middleware serveur (`hooks.server.ts`) detecte la locale et injecte les placeholders dans le HTML shell.

8. **Deploiement web Docker multi-stage** : le Dockerfile separe l'installation des dependances, le build, et le runtime. L'image finale ne contient que le build SvelteKit compile et les `node_modules` de production, tournant sous l'utilisateur `node` non-root sur Alpine.

## Extraits de code remarquables

### 1. Entite Bookmark — type valeur pur et `Sendable`

**Fichier** : `application/Packages/LinkKeepCore/Sources/Domain/Entities/Bookmark.swift`

```swift
public struct Bookmark: Identifiable, Hashable, Sendable {
    public let id: UUID
    public var title: String
    public var urlString: String
    public var domain: String

    public var note: String?
    public var isPinned: Bool
    public var isArchived: Bool
    public var visitCount: Int
    public var lastVisitedAt: Date?
    public var reminderDate: Date?
    public var linkHealthStatus: LinkHealthStatus
    public var isLinkDead: Bool
    public var lastHealthCheckAt: Date?
    public var createdAt: Date
    public var updatedAt: Date
    public var sortOrder: Int
    public var categoryID: UUID
    public var groupID: UUID?

    public init(
        id: UUID = UUID(),
        title: String,
        urlString: String,
        domain: String,
        note: String? = nil,
        isPinned: Bool = false,
        isArchived: Bool = false,
        visitCount: Int = 0,
        lastVisitedAt: Date? = nil,
        reminderDate: Date? = nil,
        linkHealthStatus: LinkHealthStatus = .unchecked,
        isLinkDead: Bool = false,
        lastHealthCheckAt: Date? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        sortOrder: Int = 0,
        categoryID: UUID,
        groupID: UUID? = nil
    ) { /* ... */ }
}
```

**Pourquoi c'est interessant** : L'entite est un `struct` immutable (`id` en `let`) et conforme a `Sendable`, sans aucune dependance Core Data ou framework de persistence. Elle vit dans le module Domain, ce qui signifie que toute la logique metier et les tests peuvent manipuler des bookmarks sans toucher a la couche Data. Les relations sont representees par des UUID (`categoryID`, `groupID`) plutot que par des references objet, ce qui simplifie la serialisation et evite les couplages.

---

### 2. Protocole BookmarkRepository — contrat d'acces aux donnees

**Fichier** : `application/Packages/LinkKeepCore/Sources/Domain/Protocols/BookmarkRepository.swift`

```swift
public protocol BookmarkRepository: Sendable {
    func fetchAll() throws -> [Bookmark]
    func fetchAllForCategory(_ categoryID: UUID) throws -> [Bookmark]
    func fetchAllForGroup(_ groupID: UUID) throws -> [Bookmark]
    func fetch(by id: UUID) throws -> Bookmark?
    func fetchByURL(urlString: String) throws -> Bookmark?
    func search(query: String) throws -> [Bookmark]
    func countAll() throws -> Int
    func countForCategory(_ categoryID: UUID) throws -> Int
    func create(_ bookmark: Bookmark) throws
    func update(_ bookmark: Bookmark) throws
    func delete(ids: Set<UUID>) throws
    func move(ids: Set<UUID>, toCategoryID: UUID, groupID: UUID?) throws
    func moveToGroup(ids: Set<UUID>, groupID: UUID) throws
    func togglePin(id: UUID) throws
    func toggleArchive(id: UUID) throws
    func incrementVisitCount(id: UUID) throws
    func updateReminder(id: UUID, date: Date?) throws
    func markLinkDead(id: UUID, isDead: Bool) throws
}
```

**Pourquoi c'est interessant** : Ce protocole definit un contrat complet de CRUD + operations specialisees (recherche full-text, deplacement en masse, toggle pin/archive, compteur de visites). Sa conformite `Sendable` force les implementations a etre thread-safe. Il est defini dans Domain et implemente dans Data, illustrant une inversion de dependance classique mais rigoureuse. Les tests injectent un `FakeBookmarkRepository` local (voir extrait 7).

---

### 3. PersistenceController — stack Core Data avec fallback

**Fichier** : `application/Packages/LinkKeepCore/Sources/Data/CoreData/PersistenceController.swift`

```swift
public final class PersistenceController: @unchecked Sendable {
    public static let cloudKitContainerID = "iCloud.sudo-rahman.LinkKeep"
    public static let shared = PersistenceController()
    public static let preview: PersistenceController = { PersistenceController(inMemory: true) }()
    public static func tests() -> PersistenceController { PersistenceController(inMemory: true) }

    public let container: NSPersistentContainer
    public private(set) var loadIssue: PersistenceIssue?
    public private(set) var lastSaveIssue: PersistenceIssue?

    init(inMemory: Bool = false, cloudSyncEnabled: Bool = true, storeURL: URL? = nil) {
        let model = CoreDataModelBuilder.makeModel()
        let primary = Self.makeContainer(
            model: model, inMemory: inMemory,
            cloudSyncEnabled: cloudSyncEnabled, storeURL: storeURL
        )
        if let issue = primary.issue, !inMemory {
            print("⚠️ Falling back to in-memory persistence: \(issue.message)")
            let fallback = Self.makeContainer(
                model: model, inMemory: true,
                cloudSyncEnabled: false, storeURL: nil
            )
            self.container = fallback.container
            self.loadIssue = fallback.issue ?? issue
        } else {
            self.container = primary.container
            self.loadIssue = primary.issue
        }
        Self.configureViewContext(container.viewContext)
    }
}
```

**Pourquoi c'est interessant** : Le controller gere trois configurations distinctes (production avec CloudKit, preview in-memory, tests in-memory) et implemente un mecanisme de degradation automatique : si le store SQLite ne charge pas, il bascule vers un store in-memory tout en preservant l'information sur le probleme. L'extension `NSManagedObjectContext.saveOrRollback()` centralise la gestion d'erreur de persistence. Les `PersistenceIssue` sont des types structures que l'UI peut presenter a l'utilisateur avec titre, message et suggestion de recuperation.

---

### 4. LinkHealthService — verification HTTP concurrente avec backoff

**Fichier** : `application/Packages/LinkKeepCore/Sources/Services/Health/LinkHealthService.swift`

```swift
public final class LinkHealthService: Sendable {
    private static let maxConcurrentDomains = 4
    private static let requestTimeout: TimeInterval = 10
    private static let jitterDelayRange = 1.5 ... 4.0

    public func evaluate(
        _ items: [LinkHealthCheckItem],
        mode: LinkHealthCheckMode,
        progress: ProgressHandler? = nil,
        didStartItem: ItemStartHandler? = nil,
        didFinishItem: ItemFinishHandler? = nil
    ) async -> HealthCheckResult { /* ... */ }

    private func resolve(urlString: String) async -> ProbeResolution {
        guard let url = URL(string: urlString) else { return .dead }
        let headResolution = await requestResolution(for: url, method: "HEAD")
        switch headResolution {
        case .httpStatus(let code) where (200 ..< 400).contains(code):
            return .httpStatus(code)
        case .httpStatus(let code) where code == 404 || code == 410:
            return .dead
        case .offline: return .offline
        case .dead: return .dead
        case .httpStatus, .unverifiable: break
        }
        let getResolution = await requestResolution(for: url, method: "GET")
        /* fallback GET with Range: bytes=0-0 */
    }

    private func classify(error: Error) -> ProbeResolution {
        guard let urlError = error as? URLError else { return .unverifiable }
        switch urlError.code {
        case .notConnectedToInternet: return .offline
        case .badURL, .unsupportedURL, .cannotFindHost, .dnsLookupFailed: return .dead
        case .timedOut, .cannotConnectToHost, .networkConnectionLost: return .unverifiable
        default: return .unverifiable
        }
    }
}
```

**Pourquoi c'est interessant** : Ce service implemente un moteur de verification d'URLs sophistique avec plusieurs couches de protection : regroupement par domaine pour eviter de bombarder un seul serveur, concurrence limitee a 4 domaines via `TaskGroup`, jitter aleatoire entre les requetes d'un meme domaine, resolution en deux temps (HEAD puis GET avec header Range), classification fine des erreurs reseau, et backoff persiste par domaine via un actor `LinkHealthBackoffStore` qui stocke les metadonnees d'echec en JSON sur disque. Le mode `automatic` respecte le backoff tandis que le mode `manual` l'ignore. Le tout est `Sendable` et fonctionne avec des handlers injectables pour le testing.

---

### 5. CoreDataModelBuilder — schema Core Data programmatique

**Fichier** : `application/Packages/LinkKeepCore/Sources/Data/CoreData/CoreDataModelBuilder.swift`

```swift
enum CoreDataModelBuilder {
    nonisolated(unsafe) private static let cachedModel: NSManagedObjectModel = {
        if let url = Bundle.module.url(forResource: "LinkKeep", withExtension: "momd"),
           let model = NSManagedObjectModel(contentsOf: url) {
            return model
        }
        return buildProgrammaticModel()
    }()

    static func makeModel() -> NSManagedObjectModel { cachedModel }

    private static func buildProgrammaticModel() -> NSManagedObjectModel {
        let model = NSManagedObjectModel()
        let bookmarkEntity = NSEntityDescription()
        bookmarkEntity.name = "CDBookmark"
        bookmarkEntity.managedObjectClassName = "CDBookmark"
        bookmarkEntity.properties = [
            attribute("id", type: .UUIDAttributeType, optional: true),
            attribute("title", type: .stringAttributeType, defaultValue: ""),
            attribute("urlString", type: .stringAttributeType, defaultValue: ""),
            // ... 15 more attributes
        ]
        // Relationships, inverse relationships, fetch indexes...
        model.entities = [bookmarkEntity, categoryEntity, groupEntity]
        return model
    }
}
```

**Pourquoi c'est interessant** : SPM ne compile pas les `.xcdatamodeld` en `.momd` pour les builds en ligne de commande (`swift test`). Ce builder contourne la limitation en construisant le schema complet en code Swift, y compris les entites, attributs, relations bidirectionnelles et index de fetch. Le modele est mis en cache dans un `nonisolated(unsafe) static let` pour eviter les conflits d'entites au runtime ObjC. L'approche hybride essaie d'abord le `.momd` compile par Xcode, puis bascule sur le modele programmatique en fallback.

---

### 6. BookmarkReminderCoordinator — orchestration persistance + notification

**Fichier** : `application/Packages/LinkKeepCore/Sources/Services/Reminder/BookmarkReminderCoordinator.swift`

```swift
@MainActor
public final class BookmarkReminderCoordinator {
    private let bookmarkRepo: any BookmarkRepository
    private let reminderScheduler: any ReminderScheduling
    private let permissionAlerting: any ReminderPermissionAlerting

    public func applyReminder(for bookmarkID: UUID, date: Date?) {
        let normalizedDate = date.map(normalizeToMinute)
        do {
            try bookmarkRepo.updateReminder(id: bookmarkID, date: normalizedDate)
        } catch { return }

        guard normalizedDate != nil else {
            reminderScheduler.cancelReminder(for: bookmarkID)
            return
        }

        Task { @MainActor in
            let grantedNow = await reminderScheduler.requestPermission()
            let alreadyAuthorized = await reminderScheduler.hasReminderAuthorization()
            guard grantedNow || alreadyAuthorized else {
                permissionAlerting.notifyReminderPermissionDenied()
                return
            }
            guard let updated = try? bookmarkRepo.fetch(by: bookmarkID) else { return }
            try? reminderScheduler.scheduleReminder(for: updated)
        }
    }

    public func reconcileReminders() async { /* re-synchronise les pending notifications */ }
}
```

**Pourquoi c'est interessant** : Ce coordinator illustre un pattern d'orchestration propre : il coordonne trois dependances injectees (repository, scheduler de notifications, alerting de permission) avec une politique « persister d'abord, notifier ensuite ». La persistence reussit toujours (sauf erreur disque), et la notification est best-effort. Le coordinator est testable de bout en bout grace aux fakes (`FakeReminderScheduler`, `FakeBookmarkRepository`, `FakeReminderPermissionAlerting`). La methode `reconcileReminders` gere la reconciliation au lancement : elle supprime les notifications orphelines, met a jour les notifications stale, et preserve les notifications legacy sans metadata.

---

### 7. Tests du BookmarkReminderCoordinator — fakes locaux et scenarios exhaustifs

**Fichier** : `application/Packages/LinkKeepCore/Tests/ServicesTests/BookmarkReminderCoordinatorTests.swift`

```swift
@Suite("BookmarkReminderCoordinator")
@MainActor
struct BookmarkReminderCoordinatorTests {

    @Test("applyReminder persists a new reminder and schedules a notification")
    func applyReminderSchedulesNewReminder() async {
        let bookmarkID = UUID()
        let reminderDate = makeDate(year: 2030, month: 6, day: 15, hour: 14, minute: 30, second: 42)
        let bookmark = Bookmark(id: bookmarkID, title: "Example",
            urlString: "https://example.com", domain: "example.com",
            reminderDate: nil, categoryID: UUID())

        let repo = FakeBookmarkRepository(bookmarks: [bookmarkID: bookmark])
        let scheduler = FakeReminderScheduler()
        let coordinator = BookmarkReminderCoordinator(
            bookmarkRepo: repo, reminderScheduler: scheduler)

        coordinator.applyReminder(for: bookmarkID, date: reminderDate)
        await Task.yield()

        #expect(repo.updateReminderCalls.count == 1)
        #expect(scheduler.scheduledBookmarks.map(\.id) == [bookmarkID])
        #expect(scheduler.canceledIDs.isEmpty)
    }
}

@MainActor
private final class FakeBookmarkRepository: BookmarkRepository, @unchecked Sendable {
    var bookmarks: [UUID: Bookmark]
    private(set) var updateReminderCalls: [(UUID, Date?)] = []
    // ... full protocol implementation
}
```

**Pourquoi c'est interessant** : Les tests utilisent le framework Swift `Testing` (`@Suite`, `@Test`, `#expect`) plutot que XCTest. Chaque scenario est isole avec des fakes locaux (`FakeReminderScheduler`, `FakeBookmarkRepository`, `FakeReminderPermissionAlerting`) qui implementent les protocoles et enregistrent les appels. La suite couvre 9 scenarios differents : planification, mise a jour, suppression, permission refusee, reconciliation, entries legacy, entries orphelines, normalisation des secondes. C'est un bon exemple de test comportemental ou le nom du test decrit le comportement utilisateur visible.

---

### 8. SEO component — hreflang alternates pour 9 locales

**Fichier** : `website/src/lib/seo/seo-head.svelte`

```svelte
<script lang="ts">
	const LOCALES: { tag: string; hreflang: string; path: string }[] = [
		{ tag: "en", hreflang: "en", path: "" },
		{ tag: "fr", hreflang: "fr", path: "/fr" },
		{ tag: "de", hreflang: "de", path: "/de" },
		{ tag: "es", hreflang: "es", path: "/es" },
		{ tag: "it", hreflang: "it", path: "/it" },
		{ tag: "ja", hreflang: "ja", path: "/ja" },
		{ tag: "ko", hreflang: "ko", path: "/ko" },
		{ tag: "pt-BR", hreflang: "pt-BR", path: "/pt-BR" },
		{ tag: "zh-Hans", hreflang: "zh-Hans", path: "/zh-Hans" },
	];
	interface Props {
		title: string;
		description: string;
		canonicalUrl: string;
		pagePath?: string;
		ogLocale?: string;
	}
	let { title, description, canonicalUrl, pagePath = "", ogLocale = "en_US" }: Props = $props();
	let canonicalOrigin = $derived(new URL(canonicalUrl).origin);
	let ogImageUrl = $derived(new URL("/og-image.png", canonicalOrigin).href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<link rel="alternate" hreflang="x-default" href={xDefaultHref} />
	{#each LOCALES as loc (loc.tag)}
		<link rel="alternate" hreflang={loc.hreflang}
			href={buildAlternateUrl(canonicalOrigin, loc.path, pagePath)} />
	{/each}
</svelte:head>
```

**Pourquoi c'est interessant** : Ce composant encapsule toute la logique SEO dans un composant Svelte 5 reutilisable. Il genere automatiquement les balises canoniques, Open Graph, Twitter Cards, et surtout les hreflang alternates pour 9 locales — un signal fort pour les moteurs de recherche multilingues. Le JSON-LD de la page d'accueil enrichit avec le schema `SoftwareApplication` incluant les captures d'ecran comme `screenshot`, l'URL de download App Store, et la description localisee.

## Qualite, securite, maintenance

### Tests

- **Tests Swift** : le package `LinkKeepCore` inclut 4 cibles de test (`DomainTests`, `DataTests`, `ServicesTests`, `SharedUITests`) utilisant le framework `Testing`. Les tests couvrent le service de quota (6 scenarios), le guard des favoris (6 scenarios), l'export/import round-trip (8 scenarios), et le coordinator de rappels (9 scenarios). Les fakes sont locaux aux fichiers de test.
- **Tests web** : aucun framework de test n'est configure pour le site web. Ni Vitest ni Playwright ne sont installes. Le repo documente les commandes a utiliser si des tests sont ajoutes.
- **Validation** : `swift build` + `swift test` pour le package Swift ; `pnpm check` (svelte-check) pour le site web.

### Securite

- Les categories peuvent etre protegees par Face ID / Touch ID via `LocalAuthentication`, avec un controller d'etat `@Observable` qui gere les transitions `locked -> unlocking -> unlocked/failed`.
- Le `PersistenceController` active `NSPersistentStoreFileProtection` a `completeUntilFirstUserAuthentication` sur iOS.
- Les fichiers de backoff du link health sont stockes dans un app group container partage avec des noms hashes en SHA-256.
- L'URL de l'App Store est la seule URL externe code en dur dans le site web. Les secrets (CloudKit container ID, entitlements) sont dans les fichiers de configuration Xcode, pas dans le code source.

### Lint / Format

- Aucun SwiftLint ou SwiftFormat n'est configure.
- Aucun ESLint, Prettier, ou formatteur CSS n'est configure pour le site web.
- Le style est maintenu par convention documentee dans `AGENTS.md` et `website/AGENTS.md`.

### Logs et gestion d'erreurs

- Les erreurs de persistence Core Data sont catchees et transformees en `PersistenceIssue` structurs que l'UI peut presenter.
- Les repository methods utilisent `saveOrRollback()` pour eviter les etats incoherents.
- Le link health service differencie les erreurs reseau (offline vs unverifiable vs dead) et aborte proprement en cas de perte de connectivite.
- Les erreurs de domain sont representees par `ValidationError`, un enum `Equatable` et `Sendable` adapte aux tests.

## Liens

- **App Store** : `https://apps.apple.com/app/linkkeep/id6760005462`
- **Site de production :** `https://linkkeep.sudo-rahman.fr`