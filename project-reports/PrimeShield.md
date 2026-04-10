# PrimeShield | Rapport technique

## En bref

- **Problème adresse** : démontrer et mettre en pratique les primitives cryptographiques mathématiques sous-jacentes au protocole RSA, avec une interface graphique interactive simulant un échange sécurisé entre deux parties (Alice et Bob).
- **Ce que ça fait** : génération de nombres premiers, exponentiation rapide modulaire, test de primalité probabiliste (Fermat), calcul d'inverse modulaire (Euclide étendu), chiffrement/déchiffrement RSA complet — le tout dans une GUI native multi-plateforme.
- **Technos clés** : Rust (édition 2021), Iced (GUI), Tokio (runtime asynchrone), Rayon (parallélisme), rand.
- **Point différenciant** : implémentation _from scratch_ des primitives crypto (pas de crate externe pour RSA), parallélisme natif via Rayon pour la recherche de nombres premiers, et compilation croisée automatisée (macOS x86_64/ARM, Windows x86_64/ARM, Linux x86_64/ARM musl) via CI GitHub Actions.

## Contexte et objectif

PrimeShield est un projet pédagogique et technique qui vise à illustrer de manière tangible le fonctionnement interne du cryptosystème RSA. Plutôt que de s'appuyer sur des bibliothèques cryptographiques existantes (OpenSSL, ring…), chaque brique est réimplémentée manuellement en Rust : exponentiation rapide, test de primalité, génération de nombres premiers, PGCD, inverse modulaire.

Le projet s'adresse à un public technique (étudiants, développeurs curieux) souhaitant comprendre les fondements mathématiques de RSA en manipulant une application fonctionnelle. L'interface graphique simule un dialogue entre **Alice** (émettrice) et **Bob** (récepteur), rendant le protocole concret : on génère les clés, on chiffre, on déchiffre, et on peut même simuler une altération du message chiffré (« Fake it ») pour observer l'échec du déchiffrement.

**Auteurs** : Maxime Colliat, Rahman Yilmaz — [GitHub](https://github.com/Maxime-Cllt/PrimeShield).

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Exponentiation rapide modulaire** | Calcul de *g^x mod n* en O(log x) par doublement carré (square-and-multiply). |
| **Test de primalité déterministe** | Test par trial division jusqu'à sqrt(n) pour `u64`. |
| **Test de primalité probabiliste (Fermat)** | Vérifie *base^(n-1) ≡ 1 mod n* pour les bases 2, 3, 5, 7. |
| **Génération de nombres premiers** | Tirage aléatoire parallèle (Rayon) avec déduplication via `HashMap` partagée (`Arc<Mutex<…>>`). |
| **Génération de e premiers avec φ(n)** | Combine le test de Fermat et la vérification de coprimalité (PGCD). |
| **Inverse modulaire (Euclide étendu)** | Calcul déterministe O(log min(a,b)) via l'algorithme d'Euclide étendu. |
| **Chiffrement RSA** | *c = m^e mod n* côté Alice. |
| **Déchiffrement RSA** | *m = c^d mod n* côté Bob, exécuté sur un thread bloquant via `tokio::spawn_blocking`. |
| **Simulation d'altération** | Le bouton « Fake it » ajoute un offset aléatoire au chiffré, démontrant que le déchiffrement échoue. |
| **GUI multi-plateforme** | Interface native Iced avec thème Catppuccin Macchiato, trois panneaux (Alice, Bob, Informations publiques). |
| **Build multi-arch** | CI compilant pour 6 cibles (macOS Intel/ARM, Windows Intel/ARM, Linux Intel/ARM musl). |

## Architecture (vue d'ensemble)

```
PrimeShield/
├── src/
│   ├── main.rs                 # Point d'entrée — GUI Iced, state management, énumération Message
│   ├── fast_exponentiation.rs  # Exponentiation rapide modulaire (square-and-multiply)
│   ├── inverse_modular.rs      # Inverse modulaire (brute-force parallèle + Euclide étendu)
│   ├── prime_gen.rs            # Génération de nombres premiers (parallèle) + test de primalité
│   ├── utils.rs                # PGCD, coprimalité, test de Fermat, utilitaires RSA
│   └── tests/
│       ├── mod.rs              # Conditionnalisation #[cfg(test)]
│       └── tests.rs            # 8 tests d'intégration couvrant tous les modules
├── .github/workflows/
│   ├── test.yml                # CI : test sur push/PR master
│   └── release.yml             # Build & release multi-arch sur tag v*
├── assets/                     # Captures d'écran de l'application
├── Cargo.toml                  # Dépendances et profils de compilation
└── Cargo.lock                  # Verrouillage des versions
```

**Organisation fonctionnelle** :

- Chaque module correspond à une primitive cryptographique distincte, avec une séparation claire entre algorithmes purs (pas d'effet de bord) et gestion de l'interface.
- L'état applicatif (`App`) centralise les paramètres RSA (p, q, φ(n), e, d, n) et les messages. Le pattern Elm (update/view) d'Iced structure le flux de données : un `Message` déclenche une mise à jour d'état synchronisée, les calculs lourds sont délégués à `Task::future` + `spawn_blocking` pour ne pas bloquer la boucle événementielle.
- Les types sont calibrés : `u64` pour les nombres premiers générés, `u128` pour les produits n et les opérations modulaires, ce qui évite le recours à un big-integer externe tout en supportant des clés RSA de taille raisonnable.

## Choix techniques et raisons

### 1. Rust pour la sécurité mémoire et la performance

Le choix de Rust n'est pas anodin pour un projet cryptographique : l'absence de data races à la compilation (borrow checker), l'absence de null, et les overflow-checks en mode debug apportent des garanties que peu de langages offrent sans runtime overhead. Les types `u64`/`u128` suffisent ici pour démontrer RSA sans引入 une dépendance big-integer.

### 2. Iced comme framework GUI

Iced est un framework Rust inspiré de l'architecture Elm (Model-Update-View). Il est natif (pas de webview), cross-platform, et son modèle déclaratif se prête bien à un formulaire de démonstration. La version 0.13 utilisée apporte le support de `Task` pour les opérations asynchrones.

### 3. Parallélisme Rayon pour la génération de nombres premiers

La recherche de nombres premiers par tirage aléatoire est embarrassingly parallel. Rayon (`par_iter`, `find_map_any`) permet de répartir le travail sur tous les cœurs disponibles. Le suivi des nombres déjà testés utilise un `Arc<Mutex<HashMap>>` pour la déduplication concurrente.

### 4. Tokio + spawn_blocking pour les calculs CPU-bound

Le calcul de l'inverse modulaire et le déchiffrement RSA sont potentiellement longs. Ils sont exécutés via `tokio::task::spawn_blocking` dans un `Task::future`, ce qui libère le thread de l'event loop Iced tout en restant dans le runtime Tokio configuré par Iced.

### 5. Deux algorithmes pour l'inverse modulaire

Le fichier `inverse_modular.rs` contient deux implémentations :
- `inverse_modular` : brute-force parallèle (itération sur tout l'espace de recherche avec Rayon). Conservée à titre de comparaison pédagogique.
- `inverse_modular_fast` : Euclide étendu, déterministe en O(log n). C'est celle utilisée en production dans l'interface.

Ce choix illustre la progression algorithmique : d'abord une approche naïve mais parallélisable, puis l'algorithme optimal.

### 6. Test de Fermat comme test de primalité probabiliste

Le test utilise quatre bases (2, 3, 5, 7). C'est un compromis entre fiabilité et complexité : un nombre qui passe le test de Fermat pour ces quatre bases est très probablement premier. Ce n'est pas un test de Miller-Rabin (plus robuste), mais suffisant pour un démonstrateur pédagogique.

### 7. Profils de compilation optimisés

Le profil `release` est configuré de manière agressive : LTO activé, `codegen-units = 1`, `strip = true`, `panic = abort`, `opt-level = 2`. Cela minimise la taille du binaire final et maximise les optimisations cross-crate — important pour un exécutable distribué en release.

### 8. CI/CD multi-architecture

Le workflow de release compile pour 6 cibles (2 par OS) et publie les artefacts via `softprops/action-gh-release`. Les builds Linux utilisent le toolchain nightly et `taiki-e/setup-cross-toolchain-action` pour la compilation croisée ARM musl. Le cache Cargo est partagé par OS et architecture.

## Extraits de code remarquables

### Extrait 1 — Exponentiation rapide modulaire (square-and-multiply)

**Fichier** : `src/fast_exponentiation.rs`

```rust
/// Calcule l'exponentiation rapide de g^x mod n
pub fn exponential_fast_mod(g: u128, x: u128, modu: u128) -> u128 {
    let mut aux: u128 = g % modu; // Base initiale mod n
    let mut output: u128 = 1u128;
    let mut x: u128 = u128::from(x);

    while x != 0 {
        if x & 1 == 1 {
            output = (output * aux) % modu;
        }
        x >>= 1; // Opération de division par 2
        aux = (aux * aux) % modu; // Mise à jour de la base
    }
    return output;
}
```

**Pourquoi c'est intéressant** : C'est le cœur du chiffrement/déchiffrement RSA. L'algorithme square-and-multiply réduit la complexité de O(x) à O(log x) multiplications modulaires. L'utilisation d'opérateurs bit à bit (`& 1`, `>>= 1`) pour parcourir les bits de l'exposant est à la fois idiomatique en Rust et performante. Chaque multiplication est suivie d'un modulo pour éviter tout débordement sur `u128`.

---

### Extrait 2 — Inverse modulaire par l'algorithme d'Euclide étendu

**Fichier** : `src/inverse_modular.rs`

```rust
fn extended_gcd(a: i128, b: i128) -> (i128, i128, i128) {
    if a == 0 {
        (b, 0, 1)
    } else {
        let (gcd, x1, y1) = extended_gcd(b % a, a);
        let x: i128 = y1 - (b / a) * x1;
        let y: i128 = x1;
        (gcd, x, y)
    }
}

pub fn inverse_modular_fast(a: u128, m: u128) -> Option<u128> {
    let a: i128 = i128::try_from(a).unwrap();
    let m: i128 = i128::try_from(m).unwrap();

    let (gcd, x, _) = extended_gcd(a, m);
    if gcd == 1 {
        Some(((x % m + m) % m) as u128) // Résultat positif garanti
    } else {
        None
    }
}
```

**Pourquoi c'est intéressant** : L'Euclide étendu résout *a·x ≡ 1 mod m* en O(log min(a,m)), rendant le calcul de la clé privée d instantané même pour de grandes valeurs. L'expression `(x % m + m) % m` est un idiome classique pour garantir un résultat positif en arithmétique modulaire signée. Le type `Option<u128>` force l'appelant à gérer explicitement le cas où l'inverse n'existe pas. La conversion via `i128` est nécessaire car les coefficients de Bézout peuvent être négatifs.

---

### Extrait 3 — Génération parallèle de nombres premiers coprimes

**Fichier** : `src/prime_gen.rs`

```rust
pub fn prime_gen_probably_and_coprime(min: u64, max: u64, nb: u128) -> u128 {
    let tested_numbers: Arc<Mutex<HashMap<u64, bool>>> = Arc::new(Mutex::new(HashMap::new()));

    rayon::iter::repeat(())
        .find_map_any(|()| {
            let num: u64 = rand::rng().random_range(min..max);
            let mut tested: MutexGuard<HashMap<u64, bool>> = tested_numbers.lock().unwrap();

            if tested.contains_key(&num) || tested.len() >= usize::try_from(max - min).unwrap() {
                return None;
            }

            if is_probably_prime(u128::from(num)) && are_coprime(u128::from(num), nb) {
                return Some(num);
            }

            tested.insert(num, false);
            None
        })
        .unwrap_or_else(|| panic!("No prime number found in range")) as u128
}
```

**Pourquoi c'est intéressant** : Cette fonction illustre un pattern de recherche parallèle en Rust : `rayon::iter::repeat(()).find_map_any(…)` lance autant de tâches que de cœurs disponibles, chacune tirant un candidat aléatoire et vérifiant les conditions (primalité + coprimalité avec φ(n)). La `HashMap` partagée via `Arc<Mutex<…>>` évite de re-tester le même nombre. C'est un compromis acceptable : le lock est court (lookup + insertion dans une HashMap), et le taux de collision diminue rapidement à mesure que l'espace est exploré.

---

### Extrait 4 — Test de primalité probabiliste de Fermat

**Fichier** : `src/utils.rs`

```rust
pub fn is_probably_prime(n: u128) -> bool {
    const BASES: [u128; 4] = [2, 3, 5, 7];

    if n < 2 {
        return false;
    }

    // Élimination rapide des multiples des bases
    for &base in &BASES {
        if n > base && n % base == 0 {
            return false;
        }
    }

    // Test de Fermat : base^(n-1) ≡ 1 mod n
    for &base in &BASES {
        if base < n && exponential_fast_mod(base, n - 1, n) != 1 {
            return false;
        }
    }

    return true;
}
```

**Pourquoi c'est intéressant** : Le test de Fermat est un filtre probabiliste efficace. En combinant un pré-filtre par division avec les 4 bases puis le test de Fermat proprement dit, on élimine rapidement la grande majorité des composés. L'appel à `exponential_fast_mod` (qui est en O(log n)) rend le test rapide même pour de grands nombres. Le choix de 4 bases réduit le risque de faux positifs (nombres de Carmichael) à un niveau négligeable pour un démonstrateur pédagogique.

---

### Extrait 5 — Calcul asynchrone du déchiffrement dans la GUI

**Fichier** : `src/main.rs`

```rust
Message::Decrypt => {
    let encrypted_message: u128 = self.encrypted_message.clone();
    let d: u128 = self.d;
    let n: u128 = self.n.clone();
    self.progress_decrypt = true;

    return Task::future(async move {
        let information: u128 = tokio::task::spawn_blocking(move || {
            println!("Decrypting message...");
            exponential_fast_mod(encrypted_message, d, n)
        })
        .await
        .unwrap();

        Message::DecryptedMessage(information)
    });
}
```

**Pourquoi c'est intéressant** : Cet extrait montre le pattern de délégation CPU-intensive dans une application Iced. Les données nécessaires (`encrypted_message`, `d`, `n`) sont clonées avant d'être capturées par la closure asynchrone — le borrow checker impose cette étape. `spawn_blocking` exécute l'exponentiation sur un thread dédié du pool Tokio, évitant de bloquer le thread principal de rendu. Le résultat est renvoyé via un `Message` qui met à jour l'état de manière synchronisée. Le flag `progress_decrypt` désactive le bouton pendant le calcul, fournissant un retour utilisateur immédiat.

---

### Extrait 6 — Workflow de release multi-architecture

**Fichier** : `.github/workflows/release.yml`

```yaml
build-linux:
    name: Build for Linux
    runs-on: ubuntu-latest
    strategy:
      matrix:
        arch: [ x86_64-unknown-linux-musl, aarch64-unknown-linux-musl ]
    steps:
      - name: Install Rust
        run: rustup update nightly && rustup default nightly
      - name: Install cross-compilation tools
        uses: taiki-e/setup-cross-toolchain-action@v1
        with:
          target: ${{ matrix.arch }}
      - name: Build for Linux ${{ matrix.arch }}
        run: cargo build --release --target ${{ matrix.arch }}

create-release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: [ build-darwin, build-windows, build-linux ]
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: ./artifacts/**/*
```

**Pourquoi c'est intéressant** : La pipeline compile pour 6 architectures (macOS Intel/ARM, Windows Intel/ARM, Linux Intel/ARM musl) et agrège les binaires dans une release GitHub. Le build Linux utilise le toolchain nightly et `taiki-e/setup-cross-toolchain-action` pour la cross-compilation ARM avec libc musl (statique, sans dépendance système). La cible musl garantit un binaire autonome sur n'importe quelle distribution Linux. Le job `create-release` attend la completion des trois builds avant de publier, assurant la cohérence de la release.

## Qualité, securite, maintenance

### Tests

Le projet dispose de **8 tests d'intégration** dans `src/tests/tests.rs`, couvrant :

- PGCD et coprimalité (`test_pgcd`, `test_are_co_prime`)
- Exponentiation rapide modulaire (`test_exponential_fast_mod`, `fast_exponentiation_fn_test`)
- Primalité probabiliste avec un jeu de nombres premiers et composés (`test_is_probably_prime`)
- Génération de nombres premiers pour `u64` et `u128` avec vérification de la primalité et de la plage (`test_prime_gen`)
- Inverse modulaire : vérifie que `e·d ≡ 1 mod φ(n)` pour les deux implémentations (`test_inverse_modular`, `test_mod_inverse`)
- Vérification de coprimalité de `e` avec `φ(n)` (`test_e_is_prime_with`)

Les tests sont annotés `#[tokio::test]` et mesurent le temps d'exécution pour les fonctions critiques.

### CI

- **Test automatique** sur chaque push/PR vers `master` via `.github/workflows/test.yml` (macOS latest, Rust stable, cache Cargo).
- **Release automatisée** sur tag `v*` : build 6 architectures, upload artefacts, création de release GitHub.

### Profils Cargo

- Profil `dev` : incremental, overflow-checks activés, debug complet — optimisé pour la boucle de développement.
- Profil `release` : LTO=true, codegen-units=1, strip=true, panic=abort — binaire minimal et optimisé.

### Points de vigilance

- Les fonctions `inverse_modular` (brute-force parallèle) et `is_prime` (trial division) sont marquées `#[allow(dead_code)]` et conservées à but pédagogique. Elles ne sont pas utilisées dans le flux principal de l'application.
- Le module `tests/mod.rs` contient un `mod tests;` derrière `#[cfg(test)]`, ce qui est redondant avec la conditionnalisation déjà présente dans `main.rs`. Cela fonctionne mais pourrait être simplifié.
- Les tests d'inverse modulaire mesurent les performances via `Instant::now()` et affichent le résultat — utile pour le débogage mais pas automatisable en assertion.

## Installation et execution (local)

### Prérequis

- **Rust** >= 1.84
- **Cargo** (inclus avec Rust)

### Installation

```bash
git clone https://github.com/Maxime-Cllt/PrimeShield.git
cd PrimeShield
cargo build --release
```

### Execution

**macOS / Linux** :
```bash
chmod +x target/release/PrimeShield
./target/release/PrimeShield
```

**Windows** :
```powershell
.\target\release\PrimeShield.exe
```

### Tests

```bash
cargo test
```

### Utilisation

1. Dans le panneau **Bob**, définir la plage de génération (start/end) puis cliquer **generate** pour `p` et `q`.
2. Cliquer **generate** pour `e` (nombre premier coprime avec φ(n)).
3. Cliquer **calculate** pour calculer la clé privée `d`.
4. Dans le panneau **Alice**, saisir un message (entier < n) et cliquer **encrypt**.
5. Dans le panneau **Bob**, cliquer **decrypt** pour retrouver le message original.
6. Le panneau **Public Infos** affiche les valeurs publiques (e, n, message chiffré).
7. Le bouton **Fake it** altère le chiffré pour démontrer l'échec du déchiffrement.

## Liens

- **GitHub** : [https://github.com/Maxime-Cllt/PrimeShield](https://github.com/Maxime-Cllt/PrimeShield)
- **Releases** : [https://github.com/Maxime-Cllt/PrimeShield/releases](https://github.com/Maxime-Cllt/PrimeShield/releases)
