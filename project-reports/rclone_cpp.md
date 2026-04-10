# rclone_cpp | Rapport technique

## En bref

- **Bibliothèque C++ (C++17/23) encapsulant [rclone](https://rclone.org/)** en tant que sous-processus, exposant une API orientée objet pour piloter le stockage cloud (Google Drive, SFTP, OneDrive, Dropbox, etc.).
- Fournit une couche d'abstraction complète : exécution asynchrone des commandes, parsing structuré des sorties JSON/texte, arbre de fichiers en mémoire, pool de processus avec priorité.
- Technologies clés : C++ moderne (concepts, `std::variant`, `requires`), Boost (Process, JSON, Signals2, Thread), CMake + Conan 2, CI GitHub Actions.
- Architecturé autour de trois piliers extensibles — **entities**, **parsers**, **options** — chacun héritable par l'utilisateur final.
- Pattern **Builder/Fluent** sur la classe `process` permettant de chaîner commande, options, callbacks et exécution en un seul pipeline lisible.
- Distribué comme paquet Conan (v0.6.2) avec un suite de tests Boost.Test couvrant entités, parsers, processus et pool.

## Contexte et objectif

[rclone](https://rclone.org/) est un outil CLI en Go, considéré comme le « rsync du cloud ». Il gère plus de 70 backends de stockage (Google Drive, S3, SFTP, Dropbox, OneDrive, etc.) via une interface en ligne de commande. Cependant, intégrer rclone dans une application C++ nécessite de gérer manuellement les sous-processus, le parsing des sorties, la construction des arguments et la gestion asynchrone.

**rclone_cpp** comble ce gap en offrant une bibliothèque C++ header-friendly qui :

1. Localise et lance le binaire `rclone` via `boost::process`.
2. Expose chaque commande rclone (`lsjson`, `copyto`, `sync`, `bisync`, `tree`, etc.) comme méthode C++ typée.
3. Parse automatiquement les sorties (JSON, texte structuré) en objets C++ (`file`, `remote`, `json_log`, `about`, `size`, `version`).
4. Permet de contrôler finement les options rclone via un système d'options typées et extensibles.
5. Offre un `process_pool` avec file de priorité pour paralléliser les opérations de stockage.

La bibliothèque s'adresse aux développeurs C++ souhaitant intégrer des capacités de synchronisation/gestion cloud dans leurs applications — clients de bureau, outils de backup, gestionnaires de fichiers — sans réimplémenter les protocoles de chaque provider.

## Fonctionnalités

| Catégorie | Commandes / Fonctionnalités |
|-----------|---------------------------|
| **Info & config** | `version`, `listremotes`, `config`, `config create`, `delete remote` |
| **Listing** | `lsjson`, `ls`, `lsl`, `lsd`, `lsf`, `tree` |
| **Transfert** | `copyto`, `moveto`, `sync`, `bisync`, `copyurl` |
| **Manipulation** | `mkdir`, `rmdir`, `rmdirs`, `delete`, `purge`, `touch`, `cat` |
| **Métadonnées** | `about`, `size`, `check` |
| **Maintenance** | `cleanup` |
| **Options globales/locales** | Filtres (`--include`, `--exclude`, `--max-depth`), performance (`--transfers`, `--checkers`, `--buffer-size`), logging (`--use-json-log`, `--verbose`, niveaux), listing (`--fast-list`) |
| **Process pool** | Exécution parallèle avec priorité (low/normal/high/max), configuration du nombre de slots simultanés |
| **Parsing** | JSON (lsjson), LSL (listing long), remote, version, about, size, json_log |

## Architecture (vue d'ensemble)

```
include/iridium/
├── rclone.hpp                    # Header agrégateur + alias de namespace
├── process.hpp                   # Point d'entrée : process_pool + config_create
├── entities.hpp                  # Header agrégateur d'entités
├── parsers.hpp                   # Header agrégateur de parsers + export DLL
├── options.hpp                   # Header agrégateur d'options
├── process/
│   ├── process.hpp               # Classe process (API publique)
│   ├── process_pool.hpp          # Pool avec priorité
│   └── config_create.hpp         # Builder fluent pour config create
├── entities/
│   ├── entity.hpp                # Classe de base (polymorphisme)
│   ├── file.hpp                  # Arborescence de fichiers in-memory
│   ├── remote.hpp                # Représentation d'un remote (13+ types)
│   ├── json_log.hpp              # Log structuré + stats de transfert
│   ├── about.hpp / size.hpp / version.hpp
├── parsers/
│   ├── basic_parser.hpp          # Template abstrait avec callback
│   ├── file_parser.hpp           # JSON + LSL → arbre de fichiers
│   ├── json_log_parser.hpp       # JSON → json_log (avec stats/transfers)
│   ├── remote_parser.hpp / version_parser.hpp / about_parser.hpp / size_parser.hpp
├── options/
│   ├── basic_option.hpp          # Option CLI (flag ou clé=valeur)
│   ├── filter.hpp                # --include, --exclude, --max-depth, etc.
│   ├── listing.hpp               # --fast-list, --default-time
│   ├── performance.hpp           # --transfers, --checkers, --buffer-size
│   ├── logging.hpp               # --use-json-log, --verbose, niveaux
│   └── tree.hpp                  # Options spécifiques à tree
```

**Flux de données typique** :

```
Utilisateur C++
    │
    ▼
process::initialize()          → localise le binaire rclone
    │
    ▼
process p;
p.lsjson(file)                 → construit les args ["lsjson", "remote:path"]
 .add_option(...)              → injecte des options CLI dans les args
 .every_line_parser(parser)    → connecte un callback via boost::signals2
 .execute()                    → lance boost::process::child + threads de lecture
 .wait_for_finish()            → join des threads
    │
    ▼
_process_impl_                 → 4 threads : lecture stdout, lecture stderr,
                                    wait du child, dispatch signaux
    │
    ▼
_stdout_ ──► file_parser::parse() ──► boost::json::parse()
                                         │
                                         ▼
                                   entities::file (arbre parent/enfants)
                                         │
                                         ▼
                                   callback utilisateur
```

### Patterns identifiés

- **Builder fluent** : `process` retourne `process&` sur chaque méthode, permettant le chaînage `p.lsjson(f).execute().wait_for_finish()`.
- **Strategy (parsers)** : `basic_parser<T>` est un template abstrait ; chaque parser concret (JSON, LSL, etc.) implémente `parse()`.
- **Signal/Slot** : `boost::signals2` pour les événements `on_start`, `on_finish`, `on_stop`, `every_line`.
- **Pimpl** : `_process_impl_` et `_process_pool_impl_` cachent les détails de threading et de gestion processus.
- **Factory method** : `remote::create_shared_ptr()`, `file::create_shared_ptr()`, `basic_option::uptr()`.

## Choix techniques et raisons

### 1. Encapsulation de rclone en sous-processus plutôt que liaison FFI/C

Contrairement à une approche CGO ou FFI, rclone_cpp communique avec rclone via `boost::process` en lançant un processus enfant avec pipes stdout/stderr/stdin. Ce choix évite toute dépendance au runtime Go, permet de cibler n'importe quel binaire rclone (y compris les versions custom), et isole complètement les crashes du processus rclone.

### 2. C++17/23 avec concepts pour la sécurité à la compilation

L'utilisation de `requires` (C++20 concepts) sur les templates garantit que seuls des types dérivant d'`entity` peuvent être passés aux parsers, et que les options acceptées par `add_option` sont bien des `basic_opt_uptr`. Le `std::variant` pour les callbacks (`on_finish`, `on_stop`, `on_start`) permet d'accepter plusieurs signatures sans surcharge manuelle.

### 3. Boost comme unique dépendance externe

Boost fournit à la fois la gestion de processus (`boost::process`), le parsing JSON (`boost::json`), le système de signaux (`boost::signals2`), le threading (`boost::thread` avec interruption points), et la manipulation de dates (`boost::posix_time`). Ce choix unifié réduit la surface de dépendances tout en offrant des primitives robustes et cross-platform.

### 4. Pimpl pour l'isolation de l'implémentation

Les classes `process` et `process_pool` utilisent le pattern Pimpl (`_process_impl_*` / `_process_pool_impl_*`) déclaré dans les `.cpp`, pas dans les headers. Cela accélère la compilation pour les consommateurs et permet de modifier l'implémentation interne sans casser l'ABI.

### 5. Threading non-bloquant avec lecture streaming

Chaque exécution de commande lance 4 threads : lecture stdout, lecture stderr, attente du child, et dispatch du signal de démarrage. Les données sont lues ligne par ligne et distribuées au fur et à mesure via `boost::signals2`, permettant un traitement en temps réel (parsing de fichiers au fil de l'eau, suivi de progression de transfert).

### 6. Process pool avec file de priorité

Le `process_pool` utilise un `std::map<priority, vector<process>>` trié par priorité décroissante. Un thread dispatcher consomme les processus en attente dès qu'un slot se libère. Les variables de condition synchronisent le dispatcher avec les événements de fin de processus.

### 7. Distribution via Conan 2

La bibliothèque est conçue pour être intégrée via `conan create`, avec un `conanfile.py` complet (build CMake, settings, options shared/fPIC, validation C++17). Un `test_package` autonome vérifie l'intégration de bout en bout.

### 8. Entité `file` comme arbre in-memory thread-safe

La classe `file` maintient une arborescence parent/enfants avec un `std::shared_ptr<std::mutex>` pour protéger les modifications concurrentes (ajout/suppression d'enfants). Le parser JSON construit récursivement l'arbre à partir du champ `Path` de chaque objet JSON retourné par `lsjson`.

## Extraits de code remarquables

### Extrait 1 — API fluente de `process` : chaînage type-safe

**Fichier** : `include/iridium/process/process.hpp` (lignes 44-108)

```cpp
class process
{
public:
    static auto initialize(const std::string &path_rclone = "") -> bool;

    auto wait_for_start() -> process&;
    auto wait_for_finish() -> process&;
    auto execute(bool with_global_opt = false) -> process&;

    auto every_line(std::function<void(const std::string &)> &&callback) -> process&;

    template<class T>
    auto every_line_parser(std::shared_ptr<parser::basic_parser<T>> parser) -> process&
    {
        every_line([this, parser = std::move(parser)](const std::string &line) {
            parser->parse(line);
        });
        return *this;
    }

    using on_finish_callback = std::variant<
        std::function<void()>,
        std::function<void(int)>,
        std::function<void(int, process *)>
    >;

    auto on_finish(on_finish_callback &&callback) -> process&;

    auto lsjson(const entities::file &file) -> process&;
    auto copy_to(const entities::file &source, const entities::file &destination) -> process&;
    auto sync(const entities::file &source, const entities::file &destination) -> process&;
    // ... 20+ commandes
};
```

**Pourquoi c'est intéressant** : Chaque méthode retourne `process&`, ce qui permet d'écrire `p.lsjson(f).every_line_parser(parser).execute().wait_for_finish()` — un pipeline expressif qui reste lisible. Le `std::variant` sur `on_finish_callback` accepte trois signatures différentes, résolues via `std::visit` et un helper `overloaded`. Le template `every_line_parser` utilise un concept implicite : `basic_parser<T>` impose que `T` dérive d'`entity`.

---

### Extrait 2 — Parsing JSON d'arborescence de fichiers avec construction d'arbre

**Fichier** : `src/parsers/file_parser.cpp` (lignes 53-103)

```cpp
auto file_parser::json_parse(const std::string &data) const -> void
{
    if (_parent == nullptr) return;
    auto regex = std::regex(R"(\{.*\})");
    std::smatch match;
    if (std::regex_search(data, match, regex))
    {
        try
        {
            auto json = boost::json::parse(match[0].str());
            if (json.is_object())
            {
                if (not(json.as_object().contains("Name") and
                        json.as_object().contains("Path") and
                        json.as_object().contains("Size") and
                        json.as_object().contains("IsDir") and
                        json.as_object().contains("ModTime"))) { return; }

                std::string path = json.at("Path").as_string().c_str();
                file *parent = _parent;

                // Reconstituer l'arborescence à partir du champ Path
                while (path.find_first_of('/') not_eq std::string::npos)
                {
                    auto file = std::make_shared<::file>(parent,
                        path.substr(0, path.find_first_of('/')), -1, true,
                        string_to_mode_time(json.at("ModTime").as_string().c_str()),
                        parent->remote());

                    ::file *dir = dir_is_in_parent(file.get(), parent,
                        [](const ::file &f1, const ::file &f2) {
                            return f1.name() == f2.name() and f1.is_dir() == f2.is_dir();
                        });
                    if (dir not_eq nullptr)
                        parent = dir;
                    path = path.substr(path.find_first_of('/') + 1);
                }

                file file = ::file(parent, json.at("Name").as_string().c_str(),
                    json.at("IsDir").as_bool(), string_to_mode_time(...),
                    parent->remote());
                parent->add_child(std::make_shared<::file>(file));
                callback(file);
            }
        }
        catch (const std::exception &e) { std::cerr << "Error: " << e.what() << std::endl; }
    }
}
```

**Pourquoi c'est intéressant** : Ce parser résout un problème non trivial : rclone retourne une liste plate d'objets JSON (un par fichier), chacun avec un champ `Path` relatif (ex : `Photos/2024/img.jpg`). Le parser reconstitue l'arborescence in-memory en découpant ce chemin et en vérifiant si chaque répertoire intermédiaire existe déjà dans le parent — ce qui permet de construire un arbre correct sans dupliquer les nœuds. La fonction `dir_is_in_parent` avec prédicat personnalisé illustre une utilisation flexible de la comparaison.

---

### Extrait 3 — Gestion asynchrone des sous-processus (Pimpl)

**Fichier** : `src/process/process_impl.cpp` (lignes 141-211)

```cpp
auto execute() -> void
{
    if (_state != state::not_launched)
        throw std::runtime_error("process already started");

    if (use_global_options)
        option::basic_option::add_options_to_vector(_global_options, _args);
    option::basic_option::add_options_to_vector(_local_options, _args);

    try
    {
        _in = std::make_unique<bp::opstream>();
        _out = std::make_unique<bp::ipstream>();
        _err = std::make_unique<bp::ipstream>();
        _child = bp::child(
            bp::exe(_path_rclone),
            bp::args(_args),
            bp::std_in < *_in, bp::std_out > *_out,
            bp::std_err > *_err
        );
    }
    catch (boost::wrapexcept<bp::process_error> &e) {
        std::cerr << e.what() << std::endl;
        exit(1);
    }

    _state = state::running;

    // Thread 1 : signal de démarrage
    _threads.push_back(boost::thread([this] {
        if (_signal_start) _signal_start->operator()();
    }));
    _cv.notify_all();

    // Thread 2 : lecture stdout
    _threads.push_back(boost::thread([this] {
        read_output();
        _counter_read++;
    }));

    // Thread 3 : lecture stderr
    _threads.push_back(boost::thread([this] {
        read_error();
        _counter_read++;
    }));

    // Thread 4 : attente de la fin du child + dispatch signal finish
    _threads.push_back(boost::thread([this] {
        try {
            if (_child.running()) _child.wait();
        } catch (boost::wrapexcept<bp::process_error> &e) { ... }

        if (_state not_eq state::stopped) {
            _state = (_child.exit_code() == 0) ? state::finished : state::error;

            // S'assurer que les lectures sont terminées avant de dispatcher
            while (_counter_read < 2)
                std::this_thread::sleep_for(std::chrono::milliseconds(10));

            if (_signal_finish)
                _signal_finish->operator()(_child.exit_code());
        }
    }));
}
```

**Pourquoi c'est intéressant** : L'architecture à 4 threads par processus est conçue pour ne jamais bloquer l'utilisateur. stdout et stderr sont lus en parallèle et leurs lignes sont immédiatement dispatchées via `boost::signals2`. Le thread de wait du child utilise un compteur atomique (`_counter_read`) pour s'assurer que toutes les données ont été lues avant de déclencher le callback `on_finish` — cela évite les race conditions où le signal de fin arriverait avant que les dernières lignes n'aient été parsées.

---

### Extrait 4 — Process pool avec file de priorité et synchronisation

**Fichier** : `src/process/process_pool_impl.cpp` (lignes 39-93)

```cpp
void start_thread() {
    _thread = std::thread([this] {
        _state = running;
        while (_state == running)
        {
            {
                std::unique_lock lock(_process_mutex);
                _cv_process.wait(lock, [this] {
                    if (_state == stopped) return true;
                    std::lock_guard lock(_mutex);
                    return (_running_processes < _simultaneous_processes
                            && get_process() != nullptr) || _state == stopped;
                });
            }
            if (_state == stopped) break;

            std::lock_guard lock(_mutex);
            auto* process = get_process();
            if (process == nullptr) { continue; }

            process->on_finish([this] {
                _running_processes--;
                _executed_processes++;
                _cv_process.notify_one();
                _wait_cv.notify_one();
            });
            process->on_stop([this] {
                _running_processes--;
                _executed_processes++;
                _cv_process.notify_one();
                _wait_cv.notify_one();
            });
            process->execute();
            _running_processes++;
        }
    });
    // Attendre que le thread dispatcher soit prêt
    while (_state != running)
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
}

auto get_process() -> process *
{
    // std::map trié par priorité décroissante (std::greater<>)
    for (const auto &pair: _processes)
        for (const auto &process: pair.second)
            if (process->get_state() == process::state::not_launched)
                return process.get();
    return nullptr;
}
```

**Pourquoi c'est intéressant** : Le pool utilise un `std::map<priority, vector<process>, std::greater<>>` — la clé `std::greater<>` garantit que les processus haute priorité sont toujours servis en premier. Le dispatcher tourne en boucle, réveillé par condition variable quand un nouveau processus est ajouté ou quand un slot se libère. La méthode `wait()` bloque l'appelant jusqu'à ce que tous les processus soient exécutés, en comparant `_executed_processes` au nombre total de processus dans la map.

---

### Extrait 5 — Système d'options typées et extensibles

**Fichier** : `include/iridium/options/filter.hpp` (lignes 68-104)

```cpp
class filter_file : public basic_option
{
public:
    [[nodiscard]] auto get() -> std::vector<std::string> override { return _files; }

    template<typename ...Args>
    static auto uptr(Args && ...args) -> std::unique_ptr<filter_file>
        requires (std::conjunction_v<std::is_convertible<Args, std::string> ...>)
    {
        return std::make_unique<filter_file>(std::forward<std::string>(args) ...);
    }

    template<typename ...Args>
    auto add_filter(Args && ...args) requires (std::conjunction_v<
        std::is_convertible<Args, std::string> ...>)
    {
        for (const auto &arg: {std::forward<Args>(args) ...})
            _files.push_back("--filter=" + arg);
    }

    auto copy_uptr() -> basic_opt_uptr override {
        return std::make_unique<filter_file>(*this);
    }

private:
    std::vector<std::string> _files;
};
```

**Pourquoi c'est intéressant** : `filter_file` est un cas d'option multi-valeurs : elle redéfinit `get()` pour retourner plusieurs flags `--filter=...` au lieu d'un seul. L'utilisation de variadic templates avec C++20 `requires` contraint les arguments à être convertibles en `std::string`, fournissant un message d'erreur de compilation clair en cas de mauvais type. Le pattern `copy_uptr()` est un clone polymorphique nécessaire car les options sont stockées comme `unique_ptr<basic_option>` mais doivent être copiables pour les options globales réutilisées entre les processus.

---

### Extrait 6 — Template de parser abstrait avec contrainte de concept

**Fichier** : `include/iridium/parsers/basic_parser.hpp`

```cpp
namespace iridium::rclone::parser
{
    template<class T> requires (std::is_base_of_v<entity, T>)
    class basic_parser
    {
        std::function<void(const T&)> _callback;

    protected:
        explicit basic_parser(std::function<void(const T&)> callback)
            : _callback(std::move(callback)) {}

        void callback(const T& data) const { _callback(std::move(data)); }

    public:
        virtual void parse(const std::string& data) const = 0;
        virtual ~basic_parser() = default;

        static auto create(basic_parser* parser) -> std::shared_ptr<basic_parser> {
            return std::shared_ptr<basic_parser>(parser);
        }
    };
}
```

**Pourquoi c'est intéressant** : Le `requires (std::is_base_of_v<entity, T>)` est un concept C++20 qui garantit à la compilation que tout type `T` utilisé comme entité de parsing hérite bien de la classe de base `entity`. Cela crée un contrat explicite et empêche les erreurs silencieuses. Le callback stocké comme `std::function<void(const T&)>` permet à l'utilisateur d'injecter n'importe quel traitement (affichage, accumulation, transformation) sans sous-classer davantage.

---

### Extrait 7 — Utilitaires de parsing JSON avec gestion des optionnels

**Fichier** : `src/parsers/utils.hpp`

```cpp
template<class T>
auto get_from_obj(const boost::json::object &obj, const std::string &key) -> T
{
    const auto *it = obj.if_contains(key);
    if (it)
        return boost::json::value_to<T>(obj.at(key));
    return T();
}

template<class T>
auto get_from_obj_optional(const boost::json::object &obj, const std::string &key)
    -> std::optional<T>
{
    const auto *it = obj.if_contains(key);
    if (it)
    {
        auto val = boost::json::try_value_to<T>(obj.at(key));
        if (val)
            return *val;
    }
    return std::nullopt;
}

auto string_to_mode_time(const std::string &time) -> system_clock::time_point
{
    auto tif = new boost::posix_time::time_input_facet();
    tif->set_iso_extended_format();
    std::istringstream iss(time);
    iss.imbue(std::locale(std::locale::classic(), tif));
    boost::posix_time::ptime abs_time;
    iss >> abs_time;
    boost::posix_time::ptime epoch(boost::gregorian::date(1970, 1, 1));
    boost::posix_time::time_duration diff = abs_time - epoch;
    return system_clock::from_time_t(diff.total_seconds());
}
```

**Pourquoi c'est intéressant** : Ces deux templates illustrent la distinction entre champs obligatoires et optionnels dans le parsing JSON de rclone. `get_from_obj` retourne une valeur default-constructed si la clé est absente (pour les champs structurels comme `Name`, `Size`). `get_from_obj_optional` utilise `try_value_to` et retourne `std::optional<T>`, ce qui correspond aux champs rclone qui ne sont pas toujours présents (ex : `eta`, `serverSideCopies`). La fonction `string_to_mode_time` convertit les timestamps ISO 8601 de rclone en `std::chrono::system_clock::time_point` via `boost::posix_time`.

## Qualité, sécurité, maintenance

### Tests

La bibliothèque est livrée avec un package de tests Conan (`test_package/`) utilisant **Boost.Test** et comprenant 5 exécutables :

| Binaire | Couverture |
|---------|-----------|
| `rclone_file_test` | Constructeurs (copy/move), opérateurs, arborescence parent/enfants, chemins absolus, `add_child_if_not_exist`, `remove_child` |
| `rclone_remote_test` | Création, chemins, types, factory methods |
| `rclone_json_log_test` | Setters, copy/move, conversion niveaux de log, stats |
| `rclone_process_test` | Initialisation, exécution asynchrone, options globales/locales, stop, `config_create`, `lsjson`, `touch`, `mkdir`, `copy_to`, `move_to`, `delete`, `rmdir`, `purge`, `cat`, `about`, `size`, `tree`, `check` |
| `rclone_process_pool_test` | Initialisation, ajout de processus, `wait`, stop, stop_all, clear, priorités |

Les tests d'intégration (`rclone_process_test`) exécutent de vraies commandes rclone contre le filesystem local, validant le pipeline complet (commande → exécution → parsing → exit code).

### CI

Un workflow GitHub Actions (`build_and_test.yml`) s'exécute à chaque push/pull_request :
1. Installation de rclone via le script officiel.
2. Installation de Conan via pip.
3. Détection du profil Conan, build des dépendances, `conan create .` (build + test_package).

### Gestion d'erreurs

- **Exception dédiée** : `initialize_error` hérite de `std::runtime_error` et est levée si rclone n'est pas trouvé.
- **Validation systématique** : chaque commande de listing vérifie que le fichier est un répertoire (`if (not file.is_dir()) throw`), `config_create` vérifie la présence de `name` et `type`.
- **Callbacks d'erreur** : `on_finish_error()` déclenche un callback si le code de sortie est non-nul.
- **Nettoyage automatique** : le destructeur de `_process_impl_` arrête le processus s'il est encore en cours d'exécution, évitant les orphelins.

### Limites de sécurité

- Les credentials FTP sont visibles en clair dans les tests (`config_createTest`) — à ne pas reproduire en production.
- La bibliothèque exécute un binaire externe (`rclone`) dont la sécurité dépend de l'environnement de déploiement (vérification du chemin, permissions).

## Installation et exécution (local)

### Prérequis

- **C++17 minimum** (C++23 recommandé, utilisé dans le CMakeLists)
- **CMake ≥ 3.25**
- **Conan ≥ 2.0**
- **rclone** installé et accessible dans le `$PATH` (ou chemin explicite passé à `initialize()`)
- **Boost ≥ 1.80** (géré par Conan)

### Build et installation via Conan

```bash
git clone https://github.com/Sudo-Rahman/rclone_cpp.git
cd rclone_cpp
conan profile detect --force    # si premier usage
conan install . --build=missing # résout Boost, CMake
conan create .                  # build la lib + lance les tests
```

### Utilisation dans un projet tiers

**conanfile.txt** :
```ini
[requires]
rclone_cpp/[>=0.1.0]

[generators]
CMakeDeps
CMakeToolchain
```

**CMakeLists.txt** :
```cmake
find_package(rclone_cpp)
target_link_libraries(your_target PRIVATE rclone_cpp::rclone_cpp)
```

**main.cpp** (exemple minimal) :
```cpp
#include <iridium/rclone.hpp>

auto main() -> int
{
    process::initialize();                          // localise rclone

    auto remote = ire::remote::create_shared_ptr(
        "my_drive", ire::remote::remote_type::google_drive, "");

    auto root = ire::file{nullptr, "/", 0, true,
        std::chrono::system_clock::now(), remote};

    auto parser = irp::file_parser::ptr(&root,
        [](const ire::file &file) {
            std::cout << file << std::endl;
        }, irp::file_parser::json);

    ir::process p;
    p.lsjson(root)
        .every_line_parser(parser)
        .execute()
        .wait_for_finish();

    return 0;
}
```

## Limites connues et pistes d'amélioration

- **Pas de support natif Windows** : le code contient des branches `_WIN32` (recherche de `rclone.exe`, `bp::windows::hide`), mais la CI ne teste que Linux. La portabilité Windows n'est pas garantie.
- **Parsing de dates tronquées** : `string_to_mode_time` utilise `diff.total_seconds()`, ce qui perd la précision sous-secondaire des timestamps rclone (nanosecondes).
- **Gestion mémoire manuelle** : `_process_impl_` et `_process_pool_impl_` sont alloués via `new` brut et détruits via `delete` dans le destructeur. L'utilisation de `std::unique_ptr` améliorerait la sécurité exception-safety.
- **Pas de retry/resilience** : si une commande rclone échoue (problème réseau, timeout), la bibliothèque ne propose pas de mécanisme de retry natif — il faut l'implémenter côté utilisateur.
- **Documentation API absente** : les headers sont bien commentés (Doxygen-style) mais aucun site de documentation n'est généré.
- **Pas de tests unitaires purs pour les parsers** : les parsers sont testés indirectement via les tests d'intégration (avec vrai rclone), mais pas de tests unitaires avec des données JSON en fixture.
- **`exit(1)` dans le catch de `_process_impl_::execute()`** : un crash au lancement du processus enfant termine brutalement l'application au lieu de propager une exception.

## Liens

- **Repo local** : `/Users/sr-71/Documents/portfolio/repos_to_process/rclone_cpp`
- **GitHub** : [https://github.com/Sudo-Rahman/rclone_cpp](https://github.com/Sudo-Rahman/rclone_cpp)
- **Licence** : MIT © 2024 Rahman Yilmaz
- **Version** : 0.6.2
