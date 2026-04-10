# Iridium | Rapport technique

## En bref

- **Client graphique de gestion de stockage cloud** multi-fournisseur (Google Drive, OneDrive, Dropbox, Mega, SFTP, FTP, SMB, etc.), construit en C++23 avec Qt 6.
- Délègue les opérations de transfert au binaire [rclone](https://rclone.org/) via une bibliothèque wrapper maison ([rclone_cpp](https://github.com/Sudo-Rahman/rclone_cpp)), et parse le flux JSON en temps réel pour alimenter l'UI.
- Architecture modulaire en modules fonctionnels clairs : explorateur de fichiers, moteur de recherche, synchronisation bidirectionnelle, gestionnaire de tâches avec progression granulaire.
- ~12 000 lignes de C++ sur 144 fichiers sources, multi-plateforme (macOS, Linux, Windows), GPLv3.
- Interface fluide avec composants custom (barres de progression circulaires/linéaires, delegates de vue avec cache d'icônes), thème clair/sombre détecté automatiquement.

## Contexte et objectif

Iridium est un gestionnaire de fichiers à distance unifié. Plutôt que d'utiliser l'interface web de chaque fournisseur cloud ou de jongler entre plusieurs clients lourds, l'utilisateur centralise tous ses remotes dans une seule application native de bureau. L'application vise un public technique (développeurs, administrateurs système) qui manipule régulièrement des stockages hétérogènes.

Le projet s'appuie sur rclone comme moteur de transfert sous-jacent — un choix pragmatique qui permet de supporter plus de 40 types de stockage sans réimplémenter chaque protocole. Iridium apporte la couche GUI : navigation arborescente, drag-and-drop, copier/coller, aperçu d'images, recherche multi-remotes simultanée, synchronisation avec analyse préalable, suivi de progression en temps réel.

## Fonctionnalités

### Gestion des remotes
- Configuration guidée pour 14 types de remotes : Google Drive, OneDrive, Dropbox, Mega, FTP, SFTP, SMB, PCloud, Box, OpenDrive, Alias, Crypt, CMD, et stockage local.
- Rafraîchissement automatique de la liste des remotes au démarrage et à la demande.

### Explorateur de fichiers
- Double panneau (vue en arbre côte à côte) permettant de naviguer dans deux remotes simultanément.
- Opérations : copier, coller, couper, déplacer, renommer, supprimer, créer un dossier.
- Drag-and-drop inter-panneaux.
- Tri par nom, taille, date, type.
- Visualisation des propriétés d'un fichier (taille, type MIME, date de modification).
- Aperçu d'images intégré.

### Recherche
- Recherche multi-remotes parallèle (local via `QDirIterator`, distant via `rclone lsl` avec filtres).
- Filtres avancés d'inclusion/exclusion avec tri par priorité.
- Résultats affichés dans une table avec icônes typées et contexte du remote d'origine.

### Synchronisation
- Analyse préalable (`rclone check`) affichant les différences avant synchronisation.
- Synchronisation unidirectionnelle (`sync`) avec progression fichier par fichier.
- Filtrage par inclusion/exclusion applicable à la synchronisation.

### Gestionnaire de tâches
- Vue hiérarchique parent/enfant : la tâche parent (dossier) contient des sous-tâches (fichiers individuels).
- Progression en temps réel : pourcentage, vitesse instantanée, vitesse moyenne, temps restant estimé.
- Annulation de tâches en cours, suppression de tâches terminées.
- Détection et affichage des erreurs par fichier.

### Personnalisation
- Thème clair/sombre détecté depuis le système.
- Couleur des icônes de dossiers configurable (8 couleurs).
- Paramètres rclone ajustables : nombre de transferts parallèles, intervalle de stats.
- Internationalisation (anglais, français).

## Architecture (vue d'ensemble)

```
src/
├── main.cpp                 → Point d'entrée, boot Settings + vérification rclone
├── Application/             → IridiumApp (QApplication subclass), dispatch thread-safe
├── Config/                  → Settings (JSON via Boost.PropertyTree), Global (state shared), Version
├── MainWindow/              → Fenêtre principale, onglets (Explorateur, Recherche, Sync), MenuBar
├── FileView/                → FileViewWidget (double panneau), TreeWidgets/ (modèles, vues, items)
├── Remote/                  → RemoteInfo (hérite de ire::remote), AddNewRemote/ (dialogues par type), ListRemote/
├── Rclone/                  → RcloneFile (adaptateur Qt de ire::file), RcloneNotFoundWidget
├── Task/                    → TaskTreeView, TaskRowParent/Child (hiérarchie de progression)
├── Search/                  → SearchTableView, SearchTableModel, SearchRow
├── Sync/                    → SyncTableView, SyncTableModel, SyncRow
├── Other/                   → Widgets réutilisables (CircularProgressBar, FilterGroupBox, ImagePreview…)
└── Utility/                 → Fonctions utilitaires (formatage de tailles, nombres)
```

**Flux de données typique (copie de fichier) :**

1. L'utilisateur sélectionne des fichiers dans `TreeFileView` (panneau gauche/droit).
2. Le signal `taskAdded` est émis vers `ExplorerWidget`, puis vers `TaskTreeView`.
3. `TaskTreeView::addTask` crée un `TaskRowParent`, configure un parser JSON et exécute le process rclone via `ir::process`.
4. Le parser reçoit les lignes JSON de rclone, met à jour les widgets de progression sur le thread principal (`IridiumApp::runOnMainThread`).
5. À la fin du process, le callback `on_finish` marque la tâche comme terminée ou en erreur.

**Patterns notables :**

- **Signal/slot Qt + boost::signals2** : communication inter-modules découplée. Les signaux boost (`signal_add_info`, `signal_remove_info`, `list_remote_changed`) traversent le périmètre non-Qt.
- **Pool de processus** (`ir::process_pool`) : les opérations rclone sont exécutées dans un pool dont la taille par défaut est `std::thread::hardware_concurrency()`, limitant la contention.
- **Adaptateur entité** : `RcloneFile` wrappe `ire::file` (issue de rclone_cpp) et ajoute les conversions Qt (`QString`, `QIcon`, `QDateTime`, `QMimeType`).

## Choix techniques et raisons

| # | Choix | Raison |
|---|-------|--------|
| 1 | **C++23 avec CMake** | Dernière version du langage (concepts, ranges, `std::erase_if`), build reproductible via presets Conan. Le standard 23 est exigé (`CMAKE_CXX_STANDARD 23`, `REQUIRED ON`). |
| 2 | **Qt 6 (Widgets)** | Framework GUI mature, multi-plateforme, riche en composants model/view. `AUTOMOC`, `AUTORCC`, `AUTOUIC` automatisent le boilerplate. |
| 3 | **rclone_cpp (bibliothèque wrapper)** | Encapsule l'exécution du binaire rclone, le parsing de sortie JSON, la gestion de cycle de vie des processus. Développée par le même auteur, versionnée via Conan (`rclone_cpp/[0.6.2]`). |
| 4 | **Conan comme gestionnaire de dépendances** | Résout les dépendances C++ natives (Boost, libcurl, libzip, rclone_cpp) de façon reproductible, génère les fichiers CMake via `CMakeDeps` + `CMakeToolchain`. |
| 5 | **Boost (PropertyTree, signals2, filesystem, thread, dll, json, process)** | PropertyTree pour la persistance des settings en JSON ; signals2 pour les événements cross-cutting (changement de thème, list remote) ; filesystem pour la gestion des chemins multi-OS. |
| 6 | **Dispatch thread-safe via `QMetaObject::invokeMethod`** | Les callbacks rclone s'exécutent sur des threads de travail. `IridiumApp::runOnMainThread` marshale les mises à jour d'UI vers le thread principal de Qt, évitant les accès concurrents aux widgets. |
| 7 | **Cache d'icônes (`QCache`)** dans les delegates de vue | Les delegates `CustomSearchItemDelegate` et `CustomSyncItemDelegate` utilisent un `QCache` pour éviter de recréer les icônes à chaque `paint()`, améliorant significativement les performances de rendu des tables. |
| 8 | **Packaging multi-plateforme** (CI GitHub Actions, `.deb` via fpm, `.icns` macOS, `.rc` Windows) | Le CI construit un paquet Debian via `fpm`, tag automatique et pre-release GitHub. Les ressources natives (icône, Info.plist) sont intégrées conditionnellement selon l'OS cible. |

## Extraits de code remarquables

### 1. Dispatch thread-safe vers le thread principal

**Fichier :** `src/Application/IridiumApp.cpp`

```cpp
void IridiumApp::runOnMainThread(std::function<void()> &&f)
{
	if (QThread::currentThread() != instance()->thread())
	{
		QMetaObject::invokeMethod(instance(), std::move(f), Qt::QueuedConnection);
	}
	else { f(); }
}

bool IridiumApp::event(QEvent *event)
{
	if (event->type() == QEvent::ApplicationPaletteChange)
	{
		if (palette().color(QPalette::Window).lightness() < 128)
			setProperty("dark", true);
		else setProperty("dark", false);
		onThemeChange();
	}
	return QApplication::event(event);
}
```

**Pourquoi c'est intéressant :** Le cœur du problème dans une application Qt multi-thread est de s'assurer que les widgets ne sont manipulés que depuis le thread principal. Cette méthode centralise ce dispatch en un seul point. En outre, la détection automatique du thème sombre via `ApplicationPaletteChange` et la propagation via un signal boost montre une intégration élégante entre les événements Qt et le système de signaux custom.

---

### 2. Gestion des tâches avec progression hiérarchique temps réel

**Fichier :** `src/Task/TaskTreeView.cpp` (extrait de `addTask`)

```cpp
auto parser = irp::json_log_parser::create(
	new irp::json_log_parser([this, src, dst, type, idParent](const ire::json_log &log)
	{
		IridiumApp::runOnMainThread([=,log = std::move(log)]
		{
			if (log.level() == ire::json_log::log_level::error)
			{
				// Gestion des erreurs : création de TaskRowChild pour les erreurs fichier
				size_t errId;
				if (src.isDir())
					errId = boost::hash<std::string>{}(
						src.absolute_path() + log.object() + dst.absolute_path() + log.object());
				else
					errId = boost::hash<std::string>{}(src.absolute_path() + dst.absolute_path() + to_string(type));

				if (idParent == errId)
				{
					_tasks[idParent].parent->error(log.message());
					// ...
					return;
				}
				auto task = std::make_unique<TaskRowChild>(src, dst, ire::json_log::stats::transfer());
				task->error(log.message());
				setIndexWidget(task->progressBarIndex(), task->progressBar());
				_tasks[idParent].parent->first()->appendRow(*task);
				_tasks[idParent].children.insert({errId, std::move(task)});
				return;
			}

			// Mise à jour progression pour les transferts actifs
			for (const auto &transfer: log.get_stats()->transferring)
			{
				childId = boost::hash<std::string>{}(
					src.absolute_path() + transfer.name + dst.absolute_path() + transfer.name);
				auto it = _tasks[idParent].children.find(childId);
				if (it != _tasks[idParent].children.end())
					it->second->updateData({transfer});
				else
				{
					// Création dynamique d'une sous-tâche
					auto taskChild = std::make_unique<TaskRowChild>(
						std::move(childSrc), std::move(childDst), transfer);
					_tasks[idParent].parent->first()->appendRow(*taskChild);
					setIndexWidget(taskChild->progressBarIndex(), taskChild->progressBar());
					_tasks[idParent].children.insert({childId, std::move(taskChild)});
				}
			}
		});
	}));

rclone->every_line_parser(std::move(parser));
rclone->on_finish([/* ... */](int exit) { /* marquer terminé ou en erreur */ });
rclone->execute();
```

**Pourquoi c'est intéressant :** Ce code illustre l'architecture de progression la plus complexe de l'application. Chaque tâche de copie de dossier crée dynamiquement des sous-tâches enfants au fur et à mesure que rclone rapporte les fichiers en cours de transfert. L'identification se fait par hash boost des chemins source+destination, permettant de retrouver et mettre à jour la bonne sous-tâche. La capture du parser par le processus rclone et le dispatch vers le thread principal garantissent la réactivité de l'interface.

---

### 3. Système de settings typé avec templating C++20

**Fichier :** `src/Config/Settings.hpp` (extrait)

```cpp
template<class ... Args>
requires (... && std::is_same_v<std::pair<Node, typename Args::second_type>, Args>)
static void setValue(Args &&... args)
{
    for (auto &&arg : {args...})
    {
        try
        {
            _settings.put(_nodes.at(arg.first), arg.second);
        } catch (boost::exception &e)
        {
            std::cout << "eror set Value" << diagnostic_information_what(e, true) << std::endl;
        }
    }
    saveSettings();
}

template<class Type>
static Type getValue(const Node &node)
{
    return _settings.get_child(_nodes.at(node)).get_value<Type>();
}
```

**Pourquoi c'est intéressant :** L'utilisation de C++20 concepts (`requires`) pour contraindre les types passés à `setValue` montre une approche type-safe pour la gestion de configuration. La méthode accepte un nombre variable de `std::pair<Node, T>` et persiste chaque entrée dans un arbre JSON via Boost.PropertyTree. Le mapping entre clés énumérées (`Node`) et chemins JSON (`_nodes`) centralise la structure du fichier de settings.

---

### 4. Barre de progression circulaire custom

**Fichier :** `src/Other/CircularProgressBar.cpp`

```cpp
void CircularProgressBar::paintEvent(QPaintEvent *event)
{
    Q_UNUSED(event);
    QPainter painter(this);
    painter.setRenderHint(QPainter::Antialiasing);

    QPen pen;
    pen.setWidth(int(height() * (size().height() < 50 ? 0.25 : 0.15)));
    pen.setCapStyle(Qt::RoundCap);

    auto marginRect = rect().marginsRemoved(
        QMargins(15*side/100, 15*side/100, 15*side/100, 15*side/100));

    // Cercle de fond
    pen.setColor(palette().color(QPalette::Mid));
    painter.setPen(pen);
    painter.setBrush(Qt::NoBrush);
    painter.drawEllipse(marginRect);

    // Arc de progression
    pen.setColor(currentColor());
    painter.setPen(pen);
    if (m_min == 0 && m_max == 0)
    {
        // Mode infini : animation rotative
        painter.drawArc(marginRect, -int(90*16 + m_timer_counter), int(-(360*16*0.3)));
    }
    else
    {
        int spanAngle = int((m_progress - m_min) * 360.0 / (m_max - m_min) * 16);
        painter.drawArc(marginRect, 90 * 16, -spanAngle);
    }

    // Pourcentage textuel
    if (side >= 100 and (m_min != 0 or m_max != 0) and m_show_percent)
    {
        QString pct = QString::number(static_cast<int>(m_progress / m_max * 100)) + "%";
        QFont font = painter.font();
        font.setPointSize(side / 6);
        font.setBold(true);
        painter.setFont(font);
        painter.setPen(palette().color(QPalette::WindowText));
        painter.drawText(rect(), Qt::AlignCenter, pct);
    }
}
```

**Pourquoi c'est intéressant :** Ce widget custom dessine un arc de progression avec deux modes : fini (arc proportionnel) et infini (animation rotative via timer). Les couleurs changent selon l'état (`Progress` → bleu, `Success` → vert, `Error` → rouge). Il est utilisé dans la barre de statut et les widgets d'info pour indiquer les opérations en cours. La conception respecte le thème système via `QPalette`.

---

### 5. Recherche parallèle multi-remotes

**Fichier :** `src/Search/SearchTableView.cpp` (extrait de `searchLocal` et `searchDistant`)

```cpp
void SearchTableView::searchLocal(const QString &text, const RemoteInfoPtr &remoteInfo)
{
    if (text.size() < 3) return;
    auto th = boost::thread([this, text, remoteInfo]
    {
        try
        {
            QDirIterator it(remoteInfo->full_path().c_str(),
                QDir::Files | QDir::System | QDir::Hidden | QDir::NoDotAndDotDot,
                QDirIterator::Subdirectories);
            while (it.hasNext())
            {
                boost::this_thread::interruption_point();
                it.next();
                if (it.fileName().contains(text, Qt::CaseInsensitive))
                    addFile(rcloneFile);  // mutex-protected
            }
            terminateSearch();
        }
        catch (boost::thread_interrupted &) {}
    });
    _threads.push_back(std::move(th));
}

void SearchTableView::searchDistant(option::basic_opt_uptr &&filters, const RemoteInfoPtr &remoteInfo)
{
    auto process = std::make_unique<ir::process>();
    process->add_option(std::move(filters));
    process->lsl(_remote_to_root_file[remoteInfo.get()])
        .every_line_parser(parser::file_parser::create(/* ... */))
        .on_finish([widget, this](auto) { terminateSearch(); });
    _pool.add_process(std::move(process));
}
```

**Pourquoi c'est intéressant :** La recherche illustre le double moteur de l'application. Pour les remotes locaux, un `boost::thread` parcourt le filesystem avec `QDirIterator`, avec des points d'interruption propres. Pour les remotes distants, un process rclone `lsl` est soumis au pool de processus. Les résultats sont ajoutés au modèle via un `std::mutex` (`addFile`), avec mise à jour batchée du modèle toutes les 100 entrées pour limiter les refresh UI. L'approche permet de lancer des recherches sur plusieurs remotes en parallèle.

---

### 6. Initialisation et détection de rclone

**Fichier :** `src/Config/Settings.cpp` (extrait de `initRlclone`)

```cpp
void Settings::initRlclone(std::function<void(bool)> &&rclone_init_ok)
{
    bf::path rclonePath;
    if (not _settings.get<string>(_nodes.at(RclonePath)).empty())
        rclonePath = _settings.get<string>(_nodes.at(RclonePath));
    else rclonePath = boost::process::search_path(rcloneBaseName().toStdString());

    if (rclonePath.empty())
        rclonePath = dll::program_location().parent_path().append(rcloneBaseName().toStdString());

    Global::path_rclone = rclonePath.string();
    try
    {
        rclone_init_ok(ir::process::initialize(Global::path_rclone));
        _settings.put(_nodes.at(RclonePath), Global::path_rclone);
    }
    catch (initialize_error &)
    {
        rclone_init_ok(false);
    }
}
```

**Pourquoi c'est intéressant :** La résolution du chemin rclone suit une stratégie en cascade : paramètre utilisateur → `PATH` système (`boost::process::search_path`) → répertoire de l'exécutable. Si rclone n'est pas trouvé, un dialogue dédié (`RcloneNotFoundWidget`) propose à l'utilisateur de l'installer. Cette approche robuste gère les trois OS sans conditionnels explicites dans ce code.

---

### 7. Delegate de vue avec cache d'icônes

**Fichier :** `src/Search/SearchTableView.cpp` (classe `CustomSearchItemDelegate`)

```cpp
class CustomSearchItemDelegate : public QStyledItemDelegate
{
public:
    CustomSearchItemDelegate(SearchTableModel *model, QObject *parent = nullptr)
        : QStyledItemDelegate(parent), _model(model)
    {
        _iconCache.setMaxCost(1000);
    }

    void paint(QPainter *painter, const QStyleOptionViewItem &option, const QModelIndex &index) const override
    {
        painter->save();
        auto icon = getIconForIndex(index);
        if (!icon.isNull())
        {
            QSize size(static_cast<int>(option.rect.height() / 1.5),
                       static_cast<int>(option.rect.height() / 1.5));
            int yOffset = (option.rect.height() - size.height()) / 2;
            QRect targetRect(QPoint(option.rect.left() + 5, option.rect.top() + yOffset), size);
            icon.paint(painter, targetRect, Qt::AlignLeft | Qt::AlignVCenter);
            QRect textRect = option.rect;
            textRect.setLeft(targetRect.right() + 5);
            drawElidedText(painter, textRect, index.data(Qt::DisplayRole).toString(), option.font);
        }
        painter->restore();
    }

private:
    mutable QCache<std::pair<int, int>, QIcon> _iconCache;

    QIcon& getIconForIndex(const QModelIndex &index) const
    {
        std::pair key(index.row(), index.column());
        if (!_iconCache.contains(key))
        {
            QIcon *icon = new QIcon;
            if (index.column() == 0)
                *icon = _model->data(index)->file()->getIcon();
            else if (index.column() == 1)
                *icon = _model->data(index)->file()->getRemoteInfo()->getIcon();
            _iconCache.insert(key, icon);
        }
        return *_iconCache[key];
    }
};
```

**Pourquoi c'est intéressant :** Les delegates Qt sont appelés à chaque `paint()` — pour des tables avec des centaines de lignes, la résolution d'icône MIME à chaque frame serait prohibitif. Le `QCache` LRU (1000 entrées) élimine ce goulot d'étranglement. La même technique est appliquée dans `SyncTableView` avec un cache de 10 000 entrées. L'approche est typique de l'optimisation de rendu dans les modèles de vue Qt personnalisés.

## Qualité, sécurité, maintenance

### Tests
Le dépôt ne contient pas de suite de tests automatisés. Le fichier `Rapport_GL.pdf` dans les sources externes fait référence à un diagramme de classes de tests, mais celui-ci concerne un projet différent (Vanadium, en Java Swing).

### CI/CD
Un workflow GitHub Actions (`.github/workflows/build.yml`) est configuré pour :
- Build Linux (Ubuntu) avec Qt 6.4.2, Conan, rclone_cpp.
- Packaging `.deb` via `fpm`.
- Création automatique de tag et pre-release GitHub.
- Les builds Windows et macOS sont commentés (`TODO`), indiquant une intégration en cours.

### Gestion d'erreurs
- Les erreurs rclone sont captées via le parser JSON (`log_level::error`) et affichées dans les lignes de tâches avec tooltip.
- Les exceptions boost (`ptree_bad_path`, `initialize_error`, `bad_any_cast`, `bad_variant_access`) sont attrapées localement avec logging (`qDebug`, `std::cout`).
- Un dialogue de confirmation empêche la fermeture de l'application si des tâches sont en cours.

### Sécurité
- Aucune credential ou clé API visible dans le code source.
- Le fichier `.gitignore` exclut le binaire `rclone*` et les répertoires de build.
- Les fichiers temporaires créés pour les aperçus sont tracés dans les settings et nettoyés à la fermeture (`Settings::deleteAllTempFiles`).

### Internationalisation
- Fichier de traduction Qt (`languages/iridium_en.ts`), support français par défaut et anglais.
- Les chaînes de l'UI sont wrappées dans `tr()`.

## Installation et execution (local)

### Prérequis
- **CMake** ≥ 3.25
- **Qt 6** (modules : Core, Gui, Widgets, LinguistTools)
- **Conan** (gestionnaire de paquets C++)
- **rclone** installé et accessible dans le `PATH`
- Un compilateur supportant C++23 (GCC ≥ 12, Clang ≥ 16, MSVC ≥ 19.34)

### Compilation (macOS / Linux)

```bash
git clone https://github.com/Sudo-Rahman/Iridium.git
cd Iridium
conan install . --build=missing
cmake --preset conan-release -DCMAKE_PREFIX_PATH="path/to/Qt/installation/cmake"
cmake --build --parallel --preset conan-release
```

### Exécution

```bash
./build/Release/Iridium
```

L'application détecte automatiquement rclone. Si le binaire n'est pas trouvé, un dialogue propose son installation.

### Dépendances gérées par Conan

Déclarées dans `conanfile.py` :
- `rclone_cpp/[0.6.2]`
- `boost/[>=1.80.0]`
- `libcurl/[>=8.0.0]`
- `libzip/[>=1.10.0]`

## Liens

- **GitHub :** [https://github.com/Sudo-Rahman/Iridium](https://github.com/Sudo-Rahman/Iridium)
- **Bibliothèque rclone_cpp :** [https://github.com/Sudo-Rahman/rclone_cpp](https://github.com/Sudo-Rahman/rclone_cpp)
- **Icônes Fluent :** [https://github.com/vinceliuice/Fluent-icon-theme](https://github.com/vinceliuice/Fluent-icon-theme)
- **Licence :** GNU General Public License v3
