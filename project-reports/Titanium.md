# Titanium | Rapport technique

## En bref

- Application bureautique de gestion de contacts développée en **C++17/23** avec le framework **Qt 5/6** (Widgets + SQL).
- Permet de créer, modifier, supprimer des contacts, d'y associer des interactions et des tâches (`@todo` / `@date`), de rechercher, trier, exporter/importer en JSON, et de consulter un historique complet des opérations.
- Persistance assurée par **SQLite** via le module QtSql ; les dates sont stockées en microsecondes epoch (`uint64_t`), servant de clés primaires.
- Architecture en couches claires : modèles métier (std) / adaptateurs Qt / couche base de données / couche présentation (widgets), avec une séparation volontaire entre primitives standard C++ et types Qt.
- Multi-plateforme : compilation par **qmake** ou **CMake**, avec gestion spécifique macOS (bundle `.icns`), Windows (`.rc` + `windeployqt`) et Linux.
- Licence **LGPL v3**.

## Contexte et objectif

Titanium est un projet de développement logiciel académique (niveau L3) réalisé par **Rahman Yilmaz**. L'objectif est de produire une application graphique complète de gestion de contacts en C++/Qt, intégrant des notions de persistance (SQLite), de sérialisation (JSON), d'IHM avancée (dialogues, toolbar, menus contextuels, scroll areas), et d'historisation des actions.

Le besoin métier est simple mais complet : un carnet d'adresses enrichi où chaque contact possède des interactions, et chaque interaction peut contenir des tâches extraites automatiquement d'un langage de balisage (`@todo`, `@date`). Le projet démontre une maîtrise de Qt (signaux/slots, widgets, layouts, ressources embarquées) et une conception orientée objet soignée.

## Fonctionnalités

| Catégorie | Fonctionnalité |
|---|---|
| **Contacts** | Création, modification, suppression (unitaire et multiple) d'un contact avec nom, prénom, entreprise, mail, téléphone, photo |
| **Interactions** | Ajout et modification d'interactions associées à un contact, avec contenu textuel libre |
| **Tâches** | Extraction automatique des lignes `@todo` dans une interaction ; spécification de date via `@date jj/mm/aaaa` |
| **Recherche** | Recherche basique (tous champs) ou avancée (par attribut + plage de dates) de contacts |
| **Tri** | Tri des contacts par nom ou date de création (croissant/décroissant) |
| **Affichage des tâches** | Vue globale de toutes les tâches de tous les contacts triées par date, avec option « masquer les tâches passées » |
| **Historique** | Journalisation de toutes les opérations (ajout, modification, suppression) sur contacts et interactions |
| **Export/Import JSON** | Export de l'ensemble des contacts/interactions/tâches en JSON ; import avec détection des doublons |
| **Personnalisation** | Changement de police via les réglages ; thèmes clair/sombre du système |
| **IHM** | Toolbar avec icônes, menus contextuels (clic droit), raccourcis clavier, barre de statut, scroll areas |

## Architecture (vue d'ensemble)

```
src/
├── main.cpp                    # Point d'entrée QApplication
├── MainWindow/                 # Fenêtre principale, orchestration signaux/slots
├── Contact/
│   ├── StdContact.{h,cpp}      # Modèle métier pur C++ (std::string, uint64_t)
│   ├── QtContact.{h,cpp}       # Adaptateur Qt (QString, uint64_t)
│   ├── StdListContact.{h,cpp}  # Collection de contacts (std::list<StdContact*>)
│   └── Widget/
│       ├── GroupeBoxContact    # Widget carte d'un contact (clic gauche = détails, droit = menu)
│       └── ListContactWidget   # ScrollArea contenant les cartes de contacts
├── ContactDialog/
│   ├── ContactDialog           # Base abstraite pour les formulaires contact
│   ├── CreationContactDialog   # Formulaire de création
│   └── ModifContactDialog      # Formulaire de modification
├── Interaction/
│   ├── Interaction.{h,cpp}     # Modèle métier d'une interaction
│   ├── ListInteraction.{h,cpp} # Collection d'interactions
│   └── Widget/
│       ├── InteractionTextEdit  # TextEdit avec parsing @todo / @date et coloration
│       ├── GroupBoxInteraction  # Widget d'affichage d'une interaction
│       ├── ListInteractionWidget# Liste scrollable d'interactions
│       └── CreationInteractionDialog
├── Tache/
│   ├── Tache.{h,cpp}           # Modèle métier d'une tâche (contenu + date)
│   ├── ListTache.{h,cpp}       # Collection de tâches
│   └── Widget/
│       └── RechercheTaches     # Filtrage/tri des tâches d'un contact
├── BaseDeDonnees/
│   └── BD.{h,cpp}              # Couche d'accès SQLite (CRUD complet)
├── Json/
│   └── JsonConverter.{h,cpp}   # Sérialisation/désérialisation JSON (QtJson)
├── Historique/
│   └── ListHistorique.{h,cpp}  # Journal d'opérations (persisté en fichier texte)
├── Utility/
│   └── Utility.{h,cpp}         # Conversions StdContact ↔ QtContact, navigation widget
├── Menu/
│   ├── MenuBar                 # Barre de menus (Paramètres, À propos, JSON)
│   └── ExportImportContacts/
│       └── ExportImportMenu    # Actions export/import JSON
├── ToolBar/
│   ├── ToolBar                 # Toolbar principale (ajout, recherche, tri, historique, suppression)
│   ├── RechercheContact/       # Dialog de recherche (basique + avancée)
│   ├── RechercheTache/         # Dialog d'affichage global des tâches (TreeWidget)
│   └── Suppression/            # Dialog de suppression multiple
```

### Flux de données

1. **Au lancement** : `BD` ouvre/initialise la base SQLite, charge tous les contacts avec leurs interactions et tâches imbriquées via `BD::getContactData()`.
2. **Affichage** : `MainWindow` crée un `ListContactWidget` (scroll area de `GroupeBoxContact`). Un clic gauche sur une carte affiche ses interactions dans le panneau droit.
3. **Modification** : Les formulaires héritent de `ContactDialog` (classe abstraite). Après validation, les données transitent par `Utility` pour conversion Std↔Qt, puis sont persistées via les méthodes statiques de `BD`.
4. **Signaux/slots** : Toute l'orchestration repose sur les signaux/slots Qt. `MainWindow::allConnnect()` centralise les connexions entre toolbar, menu, liste de contacts et zone d'interactions.

## Choix techniques et raisons

### 1. Double modèle de données (StdContact / QtContact)

Le projet définit deux classes miroirs : `StdContact` (attributs `std::string`) et `QtContact` (attributs `QString`). La classe `Utility` assure la traduction entre les deux. Ce choix permet de découpler le métier pur C++ (comparaisons, tri, `operator<<`) de la couche présentation Qt (affichage, saisie, base de données). C'est une approche de type **Adapter** qui facilite les tests unitaires du métier indépendamment de Qt.

### 2. Timestamps microsecondes comme identifiants

Les clés primaires (contacts, interactions) sont des `uint64_t` obtenus via `std::chrono::system_clock::now().time_since_epoch().count()` en microsecondes. Ce choix garantit l'unicité sans séquence externe et simplifie le tri chronologique natif. En revanche, il rend les IDs non lisibles par un humain et interdit la réutilisation après suppression.

### 3. SQLite embarqué via QtSql

La base de données est un fichier `database.sqlite` colocalisé avec l'exécutable. Le module QtSql fournit l'API (`QSqlQuery`, `QSqlDatabase`). Le schéma est créé automatiquement au premier lancement si le fichier n'existe pas. Ce choix offre zéro configuration côté utilisateur et un déploiement simple.

### 4. Parsing structuré des tâches dans les interactions

Le contenu d'une interaction est du texte libre. L'éditeur (`InteractionTextEdit`) détecte les lignes contenant `@todo` et les extrait automatiquement en objets `Tache`. La balise `@date jj/mm/aaaa` permet de spécifier une date d'échéance, parsée via `struct tm` + `mktime`. Ce mini-langage offre une ergonomie naturelle sans formulaire dédié.

### 5. Persistance de l'historique en fichier texte

L'historique (`ListHistorique`) hérite de `std::list<std::string>` et sauvegarde ses entrées dans `log.txt`. Les sauts de ligne sont encodés en `|` pour conserver une ligne par événement. C'est simple et efficace, bien que cela interdise les recherches structurées.

### 6. Export/Import JSON via QtJson

`JsonConverter` sérialise la hiérarchie complète (contacts → interactions → tâches) en `QJsonObject`. L'import détecte les doublons avant insertion. Le format JSON est un choix portable et lisible, même si le schéma reste spécifique à l'application.

### 7. Build dual qmake / CMake

Le projet fournit à la fois `Titanium.pro` et `CMakeLists.txt`, couvrant aussi bien les environnements Qt Creator natifs que les workflows CMake modernes. Le CMakeLists gère les particularismes macOS (bundle) et Windows (fichier `.rc`).

### 8. Gestion mémoire manuelle avec propriété explicite

Le code utilise massivement des pointeurs nus (`StdContact*`, `Interaction*`) avec `delete` dans les destructeurs. Les `std::list<T*>` ont la responsabilité de leurs éléments. C'est cohérent avec le style Qt (hiérarchie de parenté), mais demande rigueur pour éviter les fuites ou doubles suppressions.

## Extraits de code remarquables

### 1. Initialisation de la base de données et création du schéma

**Fichier** : `src/BaseDeDonnees/BD.cpp`

```cpp
BD::BD(QObject *parent) : QObject(parent)
{
    QString path(qApp->applicationDirPath()+"/database.sqlite");
    bool exist = QFileInfo::exists(path);
    db = QSqlDatabase::addDatabase("QSQLITE");
    db.setDatabaseName(path);

    if (!db.open())
    {
        qDebug() << "Erreur : impossible de se connecter à la base de donné.";
        exit(0);
    } else
    {
        qDebug() << "Database: connection ok";
    }

    if (!exist)
    {
        QSqlQuery query;
        query.exec("CREATE TABLE IF NOT EXISTS CONTACTS("
                   "Nom VARCHAR(255) not null,"
                   "Prenom VARCHAR(255) not null,"
                   "Entreprise VARCHAR(255) not null,"
                   "Mail VARCHAR(255) not null,"
                   "Telephone VARCHAR(10) not null,"
                   "Photo TEXT not null,"
                   "DateCreation BIGINT PRIMARY KEY"
                   ");");

        query.exec("CREATE TABLE IF NOT EXISTS INTERACTIONS("
                   "IdContact BIGINT not null,"
                   "IdInteraction BIGINT PRIMARY KEY,"
                   "DateModification BIGINT not null,"
                   "Contenu TEXT"
                   ");");

        query.exec("CREATE TABLE IF NOT EXISTS TACHE("
                   "IdInteraction BIGINT not null,"
                   "Date BIGINT not null,"
                   "Contenu TEXT not null,"
                   "unique(IdInteraction , date, Contenu)"
                   ");");
    }
}
```

**Explication** : Le constructeur détecte si la base existe déjà. Si ce n'est pas le cas, il crée les trois tables (`CONTACTS`, `INTERACTIONS`, `TACHE`) avec leurs relations de clé étrangère logiques (`IdContact` → `DateCreation`, `IdInteraction` → timestamp). Le choix de `DateCreation BIGINT PRIMARY KEY` pour les contacts et `IdInteraction BIGINT PRIMARY KEY` pour les interactions est original : les timestamps en microsecondes servent d'identifiants uniques, ce qui garantit un tri chronologique naturel sans index supplémentaire.

---

### 2. Parsing des tâches depuis le contenu d'une interaction

**Fichier** : `src/Interaction/Widget/InteractionTextEdit.cpp`

```cpp
Interaction *InteractionTextEdit::parseTache()
{
    if (!interaction)
        interaction = new Interaction;

    QStringList lst(document()->toPlainText().split("\n"));
    auto *lstTache = new ListTache;

    for (const auto &line: lst)
    {
        QStringList lstWord(line.split(" "));
        Tache tache;
        if (lstWord.contains("@todo"))
        {
            tache.setcontenu(line.toStdString());
            lstTache->addTache(tache);
        }
    }
    interaction->setLstTache(lstTache);

    QString str = document()->toPlainText();
    for (auto tache: *lstTache->getLstTache())
        str.remove(QString::fromStdString(tache->getcontenu()));
    QString contenu;
    for (const auto &line: str.split("\n"))
    {
        if (!line.isEmpty())
            contenu += line + "\n";
    }
    interaction->setContenu(contenu.toStdString());

    parseContenu();
    return interaction;
}
```

**Explication** : Cette méthode illustre le mécanisme d'extraction des tâches. Le texte de l'interaction est découpé en lignes. Toute ligne contenant le token `@todo` est extraite en objet `Tache`, puis retirée du contenu principal de l'interaction. La séparation est propre : le corps de l'interaction et ses tâches sont distincts dans le modèle. La coloration en rouge des `@todo` dans `parseContenu()` via HTML (`<font color=red>`) complète l'expérience utilisateur.

---

### 3. Parsing de date dans les tâches

**Fichier** : `src/Tache/Tache.cpp`

```cpp
void Tache::setcontenu(const std::string &contenu)
{
    if (contenu.find("@date") != std::string::npos)
    {
        int pos = contenu.find("@date") + 6;
        int day, month, year;
        try
        {
            day = std::stoi(contenu.substr(pos, pos + 2));
            month = std::stoi(contenu.substr(pos + 3, pos + 5));
            year = std::stoi(contenu.substr(pos + 6, pos + 9));
            tm tm = {0};
            tm.tm_year = year - 1900;
            tm.tm_mon = month - 1;
            tm.tm_mday = day;
            setdate((uint64_t) mktime(&tm) * 1000000);
        } catch (std::invalid_argument)
        {
            setdate(std::chrono::duration_cast<std::chrono::microseconds>(
                    std::chrono::system_clock::now().time_since_epoch()).count());
        }
    } else
    {
        date = std::chrono::duration_cast<std::chrono::microseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count();
    }
    Tache::contenu = contenu;
}
```

**Explication** : Le setter analyse le contenu textuel pour y trouver la balise `@date` suivie du format `jj/mm/aaaa`. Si le parsing réussit, la date est convertie en timestamp microsecondes (cohérent avec le reste de l'application). En cas d'échec (`std::invalid_argument`), la date par défaut est « maintenant ». Cette approche tolérante aux erreurs évite les crashes tout en offrant une fonctionnalité puissante via une syntaxe légère intégrée au texte.

---

### 4. Orchestration signaux/slots dans MainWindow

**Fichier** : `src/MainWindow/MainWindow.cpp`

```cpp
void MainWindow::allConnnect()
{
    connect(menuBar, &MenuBar::contactImported, this, [=, this]()
    {
        lstContact->sort(StdListContact::Sort::DateDecroissant);
        listContactWidget->recreateGroupeBoxContact();
        updateNbContact();
    });

    connect(toolBar, &ToolBar::clearHistoriqueClicked, this, &MainWindow::clearHistorique);
    connect(toolBar, &ToolBar::resetActionTriggered, this, &MainWindow::resetListContactWidget);
    connect(toolBar, &ToolBar::addContact, this, &MainWindow::addContact);
    connect(toolBar, &ToolBar::contactSought, this, &MainWindow::rechercheListContactWidget);
    connect(toolBar, &ToolBar::suppContact, this, [=, this](StdListContact *lst)
    {
        suppContacts(lst);
        lstContact->sort(StdListContact::Sort::DateDecroissant);
        listContactWidget->recreateGroupeBoxContact();
    });
    connect(toolBar, &ToolBar::sorted, this, [=, this](StdListContact::Sort sort)
    {
        lstContact->sort(sort);
        listContactWidget->recreateGroupeBoxContact();
    });

    connect(listContactWidget, &ListContactWidget::suppContact, this, &MainWindow::suppContact);
    connect(listContactWidget, &ListContactWidget::resetLastConctact, this, &MainWindow::removeListInteractionWidget);
    connect(listContactWidget, &ListContactWidget::contactSelected, this, [=, this](GroupeBoxContact *box)
    {
        setListInteractionWidget(box->getListInteractionWidget());
    });
}
```

**Explication** : Cette méthode centralise toutes les connexions signaux/slots de l'application. On y voit le pattern de communication Qt : les widgets émettent des signaux (toolbar, liste de contacts) et `MainWindow` réagit en mettant à jour le modèle et la vue. Les lambdas capturant `this` permettent d'accéder à l'état de la fenêtre. L'ajout d'un contact, par exemple, déclenche : insertion dans la liste métier → mise à jour du widget → persistance en base → journalisation dans l'historique.

---

### 5. Tri polymorphe de la liste de contacts

**Fichier** : `src/Contact/StdListContact.cpp`

```cpp
void StdListContact::sort(StdListContact::Sort sort)
{
    switch (sort)
    {
        case Sort::DateDecroissant :
            lstContact->sort([](StdContact *contact1, StdContact *contact2)
                             { return *contact1 < *contact2; });
            break;
        case Sort::DateCroissant :
            lstContact->sort([](StdContact *contact1, StdContact *contact2)
                             { return *contact1 > *contact2; });
            break;
        case Sort::NomCroissant :
            lstContact->sort(
                    [](StdContact *contact1, StdContact *contact2)
                    { return contact1->getNom() > contact2->getNom(); });
            break;
        case Sort::NomDecroissant :
            lstContact->sort(
                    [](StdContact *contact1, StdContact *contact2)
                    { return contact1->getNom() < contact2->getNom(); });
            break;
    }
}
```

**Explication** : Le tri utilise un `enum` pour sélectionner le critère, et des lambdas pour la comparaison. Les opérateurs de comparaison de `StdContact` (basés sur `dateCreation`) sont réutilisés pour le tri par date. Le tri par nom utilise directement `getNom()`. Ce pattern `enum + switch + lambda` est lisible et extensible.

---

### 6. Recherche avancée de contacts avec filtres cumulatifs

**Fichier** : `src/ToolBar/RechercheContact/RechercheContactDialog.cpp`

```cpp
void RechercheContactDialog::rechercheAvance()
{
    lstContact->getLstContact()->clear();

    for (auto contact: *lstContactReference->getLstContact())
    {
        if (!lineNom->text().isEmpty())
        {
            QString str = QString::fromStdString(contact->getNom()).toLower();
            if (!str.contains(lineNom->text().toLower()))
                continue;
        }
        if (!linePrenom->text().isEmpty())
        {
            QString str = QString::fromStdString(contact->getPrenom()).toLower();
            if (!str.contains(linePrenom->text().toLower()))
                continue;
        }
        // ... Entreprise, Mail, Téléphone (même pattern) ...

        if (!(contact->getDateCreation() > (lineDateDeb->dateTime().toMSecsSinceEpoch() * 1000) &&
              contact->getDateCreation() < (lineDateFin->dateTime().toMSecsSinceEpoch() * 1000)))
            continue;

        lstContact->addContact(contact);
    }
    emit contactSought(lstContact);
}
```

**Explication** : La recherche avancée applique un filtre cumulatif (ET logique) sur chaque champ non vide. La comparaison est insensible à la casse (`toLower()`). La plage de dates utilise les `QDateTimeEdit` et compare les timestamps microsecondes. Le résultat est émis via un signal qui met à jour la vue en temps réel (les contacts non trouvés sont masqués, pas supprimés).

---

### 7. Export/Import JSON complet

**Fichier** : `src/Json/JsonConverter.cpp`

```cpp
QJsonObject JsonConverter::contactToJson(const StdContact &contact)
{
    QJsonObject jsonContact;
    jsonContact.insert("nom", QString::fromStdString(contact.getNom()));
    jsonContact.insert("prenom", QString::fromStdString(contact.getPrenom()));
    jsonContact.insert("entreprise", QString::fromStdString(contact.getEntreprise()));
    jsonContact.insert("mail", QString::fromStdString(contact.getMail()));
    jsonContact.insert("telephone", QString::fromStdString(contact.getTelephone()));
    jsonContact.insert("photo", QString::fromStdString(contact.getPhoto()));
    jsonContact.insert("interactions", interactionToJson(*contact.getLstInteraction()));
    QJsonObject json;
    json.insert(QString::number(contact.getDateCreation()), jsonContact);
    return json;
}
```

**Explication** : La sérialisation est récursive : un contact contient ses interactions, qui contiennent leurs tâches. La clé JSON de chaque contact est son timestamp de création, servant d'identifiant unique. La désérialisation (`getContact`) effectue le chemin inverse en reconstruisant les objets métier à partir du document JSON. L'import détecte les doublons via `StdListContact::contains()` avant insertion en base.

## Qualité, securite, maintenance

### Tests
Le dépôt ne contient pas de suite de tests automatisés. Le répertoire `Doxygen/` contient une documentation générée par Doxygen, attestant d'une documentation inline régulière (balises `@details`, `@param`, `@brief` sur toutes les méthodes).

### Documentation
- **Doxygen** : chaque méthode est documentée avec des commentaires `/** */` décrivant le rôle, les paramètres et le comportement.
- **UML** : le répertoire `UML/` contient un diagramme de classes et un diagramme de cas d'utilisation, illustrant la conception en amont.

### Gestion des erreurs
- Validation des champs dans les formulaires : vérification de champs non vides, contrôle du téléphone (chiffres uniquement), détection de champs sans aucune lettre ni chiffre.
- `try/catch` dans le parsing de date des tâches (`std::invalid_argument`).
- Messages `QMessageBox` pour informer l'utilisateur du succès ou de l'échec des opérations (ajout, modification, suppression, export, import).

### Sécurité
- Requêtes SQL préparées avec `bindValue`/`addBindValue` pour les insertions et mises à jour, ce qui prévient les injections SQL.
- Aucune credential ou clé API n'est présente dans le code source.
- La base de données est locale et fichier-based, sans exposition réseau.

### Logs et historique
L'historique est persisté dans `log.txt` au format `date > action {détail}`. Il est chargé au démarrage et sauvegardé à la fermeture (`closeEvent` de `MainWindow`).

## Installation et execution (local)

### Prérequis
- Qt 5 ou Qt 6 (modules : Core, Gui, Widgets, Sql)
- Compilateur C++17 minimum (C++23 configuré dans CMakeLists.txt)
- qmake ou CMake + make

### Compilation avec qmake

```bash
mkdir build && cd build
qmake ../Titanium.pro
make
```

### Compilation avec CMake

```bash
mkdir build && cd build
cmake -DCMAKE_PREFIX_PATH=/path/to/Qt ..
make
```

### Windows
Ouvrir `Titanium.pro` dans Qt Creator, compiler, puis utiliser `windeployqt.exe` pour copier les dépendances DLL nécessaires.

### Exécution
Lancer l'exécutable `Titanium` généré dans le dossier `build`. La base SQLite est créée automatiquement au premier lancement dans le même répertoire que l'exécutable.

## Liens

- **GitHub** (d'après le README) : `https://github.com/Sudo-Rahman/QT_L3`
