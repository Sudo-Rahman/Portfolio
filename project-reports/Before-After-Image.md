# Before-After-Image | Rapport technique

## En bref

- Bibliothèque Android (Jetpack Compose) permettant de comparer visuellement deux images à l'aide d'un slider interactif superposé.
- Distribuée via JitPack en tant qu'artefact Maven, consommable par une simple dépendance Gradle.
- Deux modes de chargement d'images : locale (`Painter`) ou distante (`String` URL, via Coil).
- Animation fluide avec courbe `EaseInOutCubic` lors de la transition vers un état "avant" ou "après" complet.
- Composant unique, personnalisable (labels, thumb, modifier) — aucune configuration nécessaire.
- Licence Apache 2.0, SDK minimum 23, compile/target SDK 33.

## Contexte et objectif

Le projet répond à un besoin récurrent dans les applications mobiles : présenter une comparaison visuelle entre deux états d'une même image (retouche photo, avant/après traitement, résultats médicaux, etc.). Plutôt que de réimplémenter un système de slider à chaque fois, **Before-After-Image** fournit un composant Composable prêt à l'emploi, enfichable dans n'importe quel écran Jetpack Compose.

L'objectif est de proposer une API minimale — deux surcharges de fonction — couvrant les deux cas d'usage principaux (images locales et images distantes) tout en laissant une liberté totale sur le dimensionnement et le style via le `Modifier` standard de Compose.

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Slider de comparaison** | Glissement horizontal continu (0-1) pour révéler proportionnellement l'image "avant" et l'image "après". |
| **Images locales** | Surcharge acceptant des `Painter` (ex. `painterResource`). |
| **Images distantes** | Surcharge acceptant des URLs `String`, chargement asynchrone via Coil (`AsyncImage`). |
| **Labels cliquables** | Badges "Before" / "After" positionnés en haut à gauche/droite ; un clic anime le slider vers l'état correspondant. |
| **Animation** | Transition animée de 500 ms avec courbe `EaseInOutCubic` lors du clic sur un label. |
| **Thumb personnalisable** | Le curseur du slider est un composable paramétrable (`thumb: @Composable () -> Unit`), avec un style par défaut semi-transparent. |
| **Distribution JitPack** | Publication Maven automatique via JitPack, versionnée, intégrable en une ligne de Gradle. |

## Architecture (vue d'ensemble)

Le dépôt suit la structure classique d'un projet Android multi-modules Gradle :

```
Before-After-Image/
├── Before-After-Image/          ← Module bibliothèque (com.android.library)
│   ├── build.gradle.kts
│   ├── consumer-rules.pro
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml         (permission INTERNET)
│       └── java/fr/iridium/before_after_image/
│           └── BeforeAfterImage.kt     ← Tout le code métier
├── app/                          ← Module démo (com.android.application)
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── res/drawable/              (before.png, after.png)
│       └── java/fr/iridium/beforeafterimage/
│           ├── MainActivity.kt        ← Écran de démonstration
│           └── ui/theme/              (Color, Theme, Type)
├── build.gradle.kts              ← Configuration racine (plugins)
├── settings.gradle.kts           ← Inclusion des deux modules
├── gradle.properties
├── jitpack.yml                   ← JDK 17 pour JitPack
└── README.md
```

**Séparation des responsabilités :**

- Le module `Before-After-Image` est la bibliothèque distribuable. Il ne contient qu'un unique fichier source (`BeforeAfterImage.kt`) qui expose les composants publics.
- Le module `app` est une application Android minimale qui consomme la bibliothèque via `implementation(project(":Before-After-Image"))` et affiche un écran de démonstration.
- Le thème Material3 (couleurs dynamiques, typographie) appartient exclusivement au module démo et n'est pas imposé aux consommateurs de la bibliothèque.

## Choix techniques et raisons

1. **Jetpack Compose + Material3** — Le composant est un `@Composable` pur. Compose est aujourd'hui le toolkit UI recommandé par Google pour Android. Material3 fournit les primitives de `Slider` et les tokens de thème, ce qui garantit une intégration cohérente dans toute application Material3.

2. **`clipRect` pour le masquage** — La technique centrale consiste à superposer deux `Box` occupant toute la surface, chacune masquée par `drawWithContent { clipRect(...) { drawContent() } }`. Le paramètre `left` ou `right` du `clipRect` est proportionnel à la position du slider. C'est une approche performante car elle opère au niveau du canvas GPU, sans recours à des transformations de bitmap.

3. **Coil pour le chargement distant** — `io.coil-kt:coil-compose:2.4.0` est la dépendance choisie pour `AsyncImage`. Coil est léger, Kotlin-first, et s'intègre nativement avec Compose. La permission `INTERNET` est déclarée dans le manifeste de la bibliothèque pour supporter ce cas d'usage.

4. **Animation via `animateFloatAsState`** — Lorsqu'un label est cliqué, la valeur cible du slider change et `animateFloatAsState` produit une interpolation fluide (500 ms, `EaseInOutCubic`). Le flag booléen `animate` permet de distinguer le mode "animation en cours" du mode "glissement manuel", évitant les conflits entre le geste de l'utilisateur et l'animation automatique.

5. **Publication Maven via JitPack** — Le plugin `maven-publish` est configuré dans le `build.gradle.kts` de la bibliothèque. JitPack build le projet à la demande et sert l'artefact AAR. Le fichier `jitpack.yml` spécifie OpenJDK 17 comme runtime de build. Cela évite d'avoir à publier manuellement sur Maven Central.

6. **Deux surcharges publiques, un cœur privé** — Un `@Composable private fun` central gère toute la logique (slider, animation, layout). Les deux fonctions publiques ne font que fournir les lambdas `beforeImage` et `afterImage` adaptés (soit `Image(painter=...)`, soit `AsyncImage(model=...)`). Ce pattern élimine la duplication de code tout en offrant une API claire.

7. **SDK minimum 23 / compile 33** — Le choix de `minSdk = 23` couvre plus de 99 % des appareils Android actuels. Le `compileSdk = 33` et `targetSdk = 33` sont alignés sur les versions stables au moment du développement (fin 2023). Kotlin 1.8.10 avec l'extension Compose 1.4.3 assure la compatibilité du compilateur Compose.

## Extraits de code remarquables

### Extrait 1 — Cœur du composant : superposition et masquage par `clipRect`

**Fichier :** `Before-After-Image/src/main/java/fr/iridium/before_after_image/BeforeAfterImage.kt` (lignes 38-132)

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BeforeAfterImage(
    modifier: Modifier = Modifier,
    beforeImage: @Composable () -> Unit = {},
    afterImage: @Composable () -> Unit = {},
    beforeLabel: String,
    afterLabel: String,
    thumb: @Composable () -> Unit
) {
    // Animation state
    var offset by remember { mutableStateOf(0.5f) }
    var animate by remember { mutableStateOf(false) }
    val animationOffset by animateFloatAsState(
        targetValue = offset,
        animationSpec = tween(
            durationMillis = 500, easing = EaseInOutCubic
        ),
        finishedListener = { animate = false },
        label = ""
    )

    Box(
        modifier = modifier, contentAlignment = Alignment.TopCenter
    ) {
        // AFTER image — clipped from the LEFT side of the slider
        Box(
            modifier = Modifier
                .fillMaxSize()
                .drawWithContent {
                    clipRect(left = size.width * if (animate) animationOffset else offset) {
                        this@drawWithContent.drawContent()
                    }
                }
        ) {
            afterImage()
            /* ... after label ... */
        }

        // BEFORE image — clipped from the RIGHT side of the slider
        Box(modifier = Modifier
            .fillMaxSize()
            .drawWithContent {
                clipRect(right = size.width * if (animate) animationOffset else offset) {
                    this@drawWithContent.drawContent()
                }
            }
        ) {
            beforeImage()
            /* ... before label ... */
        }

        Slider(
            value = if (animate) animationOffset else offset,
            valueRange = 0f..1f,
            onValueChange = {
                offset = it
                animate = false
            },
            colors = SliderDefaults.colors(
                activeTrackColor = Color.Transparent,
                inactiveTrackColor = Color.Transparent
            ),
            modifier = Modifier
                .padding(horizontal = 24.dp)
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp),
            thumb = { thumb() },
        )
    }
}
```

**Pourquoi c'est intéressant :** La logique de masquage repose entièrement sur `drawWithContent` + `clipRect`, ce qui signifie qu'aucune copie de pixel n'est effectuée. Le clipping est géré nativement par le pipeline de rendu Skia. La distinction entre mode animé (`animate = true`) et mode glissé (`animate = false`) évite les sauts visuels : en mode glissé, c'est `offset` (mis à jour directement par `onValueChange`) qui pilote ; en mode animation, c'est `animationOffset` (interpolation fluide).

### Extrait 2 — Labels cliquables avec animation automatique

**Fichier :** `Before-After-Image/src/main/java/fr/iridium/before_after_image/BeforeAfterImage.kt` (lignes 72-112, section labels)

```kotlin
// Inside the "after" Box — after label
if (afterLabel.isNotEmpty()) {
    Surface(
        color = Color.Transparent,
        modifier = Modifier
            .align(Alignment.TopEnd)
            .padding(16.dp)
            .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
            .clip(RoundedCornerShape(16.dp))
            .clickable {
                offset = 0f
                animate = true
            }
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = afterLabel, style = TextStyle(color = Color.White))
    }
}

// Inside the "before" Box — before label
if (beforeLabel.isNotEmpty()) {
    Surface(
        color = Color.Transparent,
        modifier = Modifier
            .align(Alignment.TopStart)
            .padding(16.dp)
            .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
            .clip(RoundedCornerShape(16.dp))
            .clickable {
                offset = 1f
                animate = true
            }
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = beforeLabel, style = TextStyle(color = Color.White))
    }
}
```

**Pourquoi c'est intéressant :** Cliquer sur le label "Before" pousse le slider à 100 % (offset = 1f), révélant entièrement l'image avant. Cliquer sur "After" le pousse à 0 % (offset = 0f). Le flag `animate = true` déclenche l'interpolation fluide. La vérification `isNotEmpty()` permet de désactiver les labels en passant une chaîne vide — un détail d'API utile.

### Extrait 3 — Surcharge pour images distantes (Coil)

**Fichier :** `Before-After-Image/src/main/java/fr/iridium/before_after_image/BeforeAfterImage.kt` (lignes 134-159)

```kotlin
@Composable
fun BeforeAfterImage(
    modifier: Modifier = Modifier,
    beforeImageUrl: String,
    afterImageUrl: String,
    beforeLabel: String = "Before",
    afterLabel: String = "After",
    thumb: @Composable () -> Unit = { CustomThumb() }
) {
    BeforeAfterImage(
        modifier = modifier,
        beforeImage = {
            AsyncImage(
                model = beforeImageUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        },
        afterImage = {
            AsyncImage(
                model = afterImageUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        },
        beforeLabel = beforeLabel,
        afterLabel = afterLabel,
        thumb = thumb
    )
}
```

**Pourquoi c'est intéressant :** Cette surcharge illustre la séparation entre l'API publique (simple, typée `String`) et le cœur privé (lambdas `@Composable`). Coil gère le téléchargement, le cache disque/mémoire, et les placeholders de manière transparente. Le `ContentScale.Crop` garantit que les deux images couvrent uniformément la surface, évitant les zones vides.

### Extrait 4 — Configuration Maven Publishing pour JitPack

**Fichier :** `Before-After-Image/build.gradle.kts` (lignes 56-67)

```kotlin
afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])
                groupId = "fr.sudo-rahman"
                artifactId = "before.after.image"
                version = "1.0"
            }
        }
    }
}
```

**Pourquoi c'est intéressant :** L'utilisation d'`afterEvaluate` est nécessaire car le composant `release` n'existe qu'après la configuration du plugin Android. Cette publication Maven permet à JitPack de construire et servir l'AAR automatiquement. Le consommateur n'a qu'à ajouter `maven { url 'https://jitpack.io' }` et la dépendance `com.github.Sudo-Rahman:BeforeAfterImage:<version>`.

### Extrait 5 — Application de démonstration

**Fichier :** `app/src/main/java/fr/iridium/beforeafterimage/MainActivity.kt` (lignes 17-36)

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BeforeAfterImageTheme {
                val beforeImage = painterResource(id = R.drawable.before)
                val afterImage = painterResource(id = R.drawable.after)
                BeforeAfterImage(
                    modifier = Modifier
                        .fillMaxWidth()
                        .fillMaxHeight(0.3f)
                        .padding(16.dp)
                        .clip(shape = RoundedCornerShape(16.dp)),
                    beforeImage = beforeImage,
                    afterImage = afterImage,
                )
            }
        }
    }
}
```

**Pourquoi c'est intéressant :** En ~15 lignes de code métier, l'application démo illustre l'intégralité de l'API : chargement de ressources locales, application d'un modifier avec coins arrondis, padding et dimensionnement relatif. Cela sert à la fois de documentation vivante et de vérité terrain pour les tests manuels.

### Extrait 6 — Thumb personnalisé par défaut

**Fichier :** `Before-After-Image/src/main/java/fr/iridium/before_after_image/BeforeAfterImage.kt` (lignes 188-201)

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CustomThumb() {
    SliderDefaults.Thumb(
        interactionSource = remember { MutableInteractionSource() },
        thumbSize = DpSize(30.dp, 30.dp),
        colors = SliderDefaults.colors(
            thumbColor = Color.White.copy(alpha = 0.6f)
        ),
        modifier = Modifier.border(
            2.dp, Color.Black.copy(alpha = 0.6f), RoundedCornerShape(100)
        )
    )
}
```

**Pourquoi c'est intéressant :** Le thumb par défaut réutilise `SliderDefaults.Thumb` de Material3, garantissant une apparence cohérente avec le design système. Les couleurs semi-transparentes (blanc 60 %, bordure noire 60 %) assurent la lisibilité sur n'importe quel fond d'image. Puisque `thumb` est un paramètre `@Composable () -> Unit`, le consommateur peut fournir son propre design sans modifier la bibliothèque.

## Qualité, sécurité, maintenance

### Tests
Aucun test unitaire ni instrumentalisé n'est présent dans le dépôt. La validation se fait par test manuel via le module `app`. Pour une bibliothèque UI Compose, des tests screenshot (ex. Paparazzi, Roborazzi) et des tests sémantiques Compose seraient des ajouts pertinents.

### Lint / Format
Le style Kotlin est déclaré comme `official` dans `gradle.properties`. Aucune configuration ktlint ou detekt n'est présente.

### CI/CD
Pas de pipeline CI configuré (pas de `.github/workflows/`). JitPack joue implicitement le rôle de CI pour la publication : un push taggé déclenche un build sur les serveurs JitPack.

### Gestion d'erreurs
Le chargement d'images distantes via Coil ne spécifie ni placeholder, ni fallback, ni gestion d'erreur dans les surcharges publiques. En cas d'URL invalide, l'espace reste vide. C'est un compromis délibéré pour garder l'API simple, mais le consommateur peut wrapper le composant ou fournir son propre lambda si un comportement de fallback est souhaité.

### Logs
Aucun logging n'est intégré dans la bibliothèque.

### Sécurité
Aucun secret, token ou clé API n'est présent dans le dépôt. La permission `INTERNET` déclarée dans le manifeste de la bibliothèque est nécessaire uniquement pour le mode de chargement distant.

## Installation et exécution (local)

### Prérequis
- **Android Studio** (Flamingo ou supérieur recommandé)
- **JDK 17** (comme spécifié dans `jitpack.yml`)
- **SDK Android** avec `compileSdk = 33`

### Build

```bash
# Cloner le dépôt
git clone https://github.com/Sudo-Rahman/Before-After-Image.git
cd Before-After-Image

# Build complet (bibliothèque + app démo)
./gradlew assembleDebug
```

### Exécution
Ouvrir le projet dans Android Studio et lancer le module `app` sur un émulateur ou un appareil physique (minSdk 23+). L'activité principale affiche un comparateur avant/après avec deux images de démonstration incluses dans les ressources.

### Intégration dans un projet tiers

1. Ajouter JitPack aux repositories dans `settings.gradle.kts` :
```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

2. Ajouter la dépendance dans le `build.gradle.kts` du module :
```kotlin
dependencies {
    implementation("com.github.Sudo-Rahman:BeforeAfterImage:<latest-version>")
}
```

3. Utiliser le composant :
```kotlin
// Images locales
BeforeAfterImage(
    beforeImage = painterResource(R.drawable.before),
    afterImage = painterResource(R.drawable.after),
    modifier = Modifier.fillMaxWidth().height(200.dp)
)

// Images distantes
BeforeAfterImage(
    beforeImageUrl = "https://example.com/before.jpg",
    afterImageUrl = "https://example.com/after.jpg",
    modifier = Modifier.fillMaxWidth().height(200.dp)
)
```

## Limites connues et pistes d'amélioration

- **Absence de tests** : Aucun test automatisé. Des tests screenshot et des tests Compose UI (assertions sémantiques sur le slider, vérification du clipping) renforceraient la confiance dans les évolutions futures.
- **Pas de gestion d'erreur réseau** : Le chargement d'images distantes via Coil ne propose ni placeholder ni indication visuelle en cas d'échec. Exposer des paramètres `error` et `placeholder` optionnels serait un ajout peu coûteux.
- **Slider vertical non supporté** : Le composant est conçu pour un glissement horizontal uniquement. Un paramètre `orientation` pourrait élargir les cas d'usage.
- **Animation fixe** : La durée (500 ms) et la courbe (`EaseInOutCubic`) ne sont pas paramétrables. Les exposer en tant que paramètres optionnels améliorerait la flexibilité.
- **Pas de CI** : L'absence de pipeline d'intégration continue signifie qu'aucune vérification automatique n'est effectuée à chaque push. Un workflow GitHub Actions (build, lint, test) serait un investissement modeste pour une maintenance plus sereine.
- **Versionnage statique** : La version `"1.0"` est en dur dans le script Gradle. L'utilisation d'une variable `VERSION_NAME` dans `gradle.properties` ou d'un plugin de versionnement sémantique faciliterait les releases.

## Liens

- **Repo local :** `/Users/sr-71/Documents/portfolio/repos_to_process/Before-After-Image`
- **GitHub :** [https://github.com/Sudo-Rahman/Before-After-Image](https://github.com/Sudo-Rahman/Before-After-Image)
- **JitPack :** [https://jitpack.io/#Sudo-Rahman/BeforeAfterImage](https://jitpack.io/#Sudo-Rahman/BeforeAfterImage)
- **Licence :** Apache License 2.0
