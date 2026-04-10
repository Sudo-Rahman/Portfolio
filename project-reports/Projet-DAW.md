# Projet-DAW (Neptune) | Rapport technique

## En bref

- **Plateforme d'apprentissage en ligne** nommée *Neptune*, proposant des cours, des QCM et un forum de discussion communautaire.
- Architecture **PHP MVC maison** sans framework, avec un routage centralisé via un point d'entrée unique (`index.php`).
- Base de données **PostgreSQL** hébergée dans un conteneur Docker, avec un schéma relationnel complet et des triggers PL/pgSQL.
- Système de **QCM dynamiques** alimentés par des fichiers XML, avec scoring et persistance des résultats.
- **Module d'administration** complet : gestion des utilisateurs, création de cours (éditeur WYSIWYG jQuery), gestion des QCM et des ressources.
- Thème UI adaptatif **clair/sombre** avec détection automatique des préférences système.

---

## Contexte et objectif

Neptune est une plateforme web éducative conçue dans le cadre d'un projet universitaire (Développement d'Applications Web — DAW). Elle vise à offrir aux apprenants un espace unifié pour :

- Consulter des **cours en ligne** structurés (paragraphes, titres, vidéos, images, QCM intégrés).
- Passer des **QCM** pour évaluer leurs connaissances et suivre leur progression.
- Échanger sur un **forum de discussion** avec création de topics et réponses en fil de discussion.
- Gérer un **profil utilisateur** complet (informations personnelles, photo de profil, statistiques).

Côté administration, les gestionnaires du site disposent d'un tableau de bord pour gérer les utilisateurs, le contenu pédagogique et les statistiques globales de la plateforme.

**Public cible** : étudiants et formateurs cherchant un environnement d'apprentissage interactif et léger.

**Auteurs** : Maxime Colliat, Yoan Dusoleil, Rahman Yilmaz.

---

## Fonctionnalités

### Espace apprenant
- **Inscription / Connexion** avec validation côté client (e-mail, pseudo unique, mot de passe ≥ 8 caractères, confirmation, date de naissance, photo de profil optionnelle).
- **Profil utilisateur** : affichage des informations personnelles, statistiques d'activité (QCM réalisés, forums créés, messages envoyés, moyenne, meilleure note).
- **Consultation des cours** : parcours de cours structurés en JSON, avec titres, paragraphes, images, vidéos YouTube intégrées et liens vers des QCM.
- **Passation de QCM** : questionnaire chronométré, calcul de la note sur 20, historisation des résultats (mise à jour si repassé).
- **Forum** : création de topics, réponse en fil de discussion, suppression de ses propres messages/topics, profil public des auteurs.

### Espace administration
- **Tableau de bord admin** : statistiques globales du site (nombre d'utilisateurs, forums, messages, QCM, cours).
- **Recherche d'utilisateurs** par pseudo (recherche regex PostgreSQL insensible à la casse).
- **Suppression d'utilisateurs** avec nettoyage automatique via trigger base de données (anonymisation des messages, suppression des résultats QCM).
- **Création de QCM** via une interface web générant du XML.
- **Création de cours** via un éditeur visuel jQuery avec menu contextuel (clic droit) pour ajouter titres, paragraphes, images, vidéos, QCM.
- **Gestion des ressources** : liste, suppression de cours et QCM (fichier + base de données).
- **Génération d'utilisateurs aléatoires** pour les tests.

### Expérience utilisateur
- **Thème clair/sombre** avec détection automatique des préférences OS (`prefers-color-scheme`) et bascule manuelle.
- **Animations au scroll** pour les éléments de la page d'accueil.
- **Barre de navigation** incluant un panneau de réglages avec affichage des cookies.
- **Anti-retour navigateur** sur les pages QCM pour empêcher la triche (`history.pushState`).

---

## Architecture (vue d'ensemble)

Le projet adopte une architecture **MVC (Modèle-Vue-Contrôleur)** simplifiée, sans framework. Le routage est assuré par un unique point d'entrée frontal.

```
Projet-DAW/
├── public/                       # Document root du serveur web
│   ├── index.php                 # Front controller (routeur)
│   ├── css/                      # Feuilles de style (16 fichiers)
│   ├── js/                       # Scripts client (8 fichiers)
│   ├── img/                      # Assets images (22 fichiers)
│   ├── xml/qcm/                  # Fichiers XML des QCM
│   └── cours/                    # Fichiers JSON des cours
├── app/
│   ├── controllers/              # Logique métier (6 contrôleurs)
│   │   ├── auth.php              # Authentification (login, register, logout)
│   │   ├── admin.php             # Administration (CRUD cours/QCM/utilisateurs)
│   │   ├── cours.php             # Consultation des cours
│   │   ├── forum.php             # Forum (topics, messages, CRUD)
│   │   ├── qcm.php               # QCM (affichage, validation, scoring)
│   │   └── user.php              # Profil utilisateur, mise à jour, suppression
│   ├── models/                   # Accès aux données (3 fichiers)
│   │   ├── DBManage.php          # Couche d'accès PostgreSQL (PDO)
│   │   ├── User.php              # Entité utilisateur
│   │   └── Utility.php           # Fonctions utilitaires (session, images)
│   └── views/                    # Vues (20+ fichiers PHP)
│       ├── navBar.php            # Navigation réutilisée
│       ├── home.php              # Page d'accueil
│       ├── adminPanel/           # Vues d'administration (5 fichiers)
│       └── ...                   # Autres vues
├── db_setup.sql                  # Script DDL + données initiales + triggers
└── README.md
```

### Flux de requêtes

1. Le navigateur envoie une requête vers `/index.php?controller=xxx&action=yyy`.
2. `public/index.php` extrait `controller` et `action` des paramètres GET.
3. Le fichier contrôleur correspondant est inclus (`app/controllers/xxx.php`).
4. La fonction d'action est appelée ; elle interagit avec les modèles et inclut la vue.
5. La vue est rendue côté serveur en PHP, avec injection des données dynamiques.

### Schéma de la base de données

```
LOGIN ──1:1──→ USERINFO ──1:1──→ ADMIN
  │                │
  │                ├── 1:N → QCMRESULTS ←── N:1 ── QCM
  │                ├── 1:N → TOPIC
  │                └── 1:N → MESSAGES (via TOPIC)
```

---

## Choix techniques et raisons

### 1. PHP natif sans framework
Le projet utilise PHP pur (pas de Laravel, Symfony ni Slim). Ce choix est cohérent avec un contexte pédagogique où l'objectif est de comprendre les mécanismes fondamentaux du web : routage manuel, sessions, requêtes préparées PDO, inclusion de fichiers.

### 2. PostgreSQL avec Docker
La base PostgreSQL tourne dans un conteneur Docker (host `pgsql`, port 5432). L'utilisation de PostgreSQL plutôt que MySQL permet de bénéficier de types natifs avancés (`GENERATED ALWAYS AS IDENTITY`), de PL/pgSQL pour les triggers, et de l'opérateur regex `~` pour la recherche d'utilisateurs.

### 3. Routage par paramètres GET
Chaque URL prend la forme `index.php?controller=X&action=Y`. Le front controller résout dynamiquement le contrôleur et la fonction à appeler. Un bloc `try/catch` affiche une page 404 si le contrôleur ou l'action est introuvable.

### 4. QCM en XML, cours en JSON
Les QCM sont stockés sous forme de fichiers XML (`public/xml/qcm/`) parsés via `SimpleXMLElement`. Les cours sont stockés en JSON (`public/cours/`) et décodés côté serveur. Cette séparation du stockage de contenu (fichiers plats) et des métadonnées (base de données) simplifie la création et l'édition de contenu via l'interface d'administration.

### 5. Salt + SHA-256 pour les mots de passe
Chaque utilisateur dispose d'un salt unique (64 caractères hexadécimaux générés via `random_bytes(32)`). Le mot de passe est hashé en SHA-256 concaténé avec le salt. Si cette approche est plus robuste qu'un hash simple, elle reste en-deçà des standards modernes (bcrypt/Argon2).

### 6. jQuery pour l'interactivité côté client
jQuery (et jQuery UI) est utilisé intensivement : validation de formulaires en AJAX, soumission asynchrone, menu contextuel (plugin `jquery-contextmenu`), boîtes de dialogue modales, redimensionnement automatique des `textarea`. L'éditeur de cours s'appuie entièrement sur jQuery pour la manipulation du DOM.

### 7. Thème UI adaptatif
Le système de thème utilise les variables CSS personnalisées (`--body-background-light`, `--body-background-dark`) et l'API `prefers-color-scheme` du navigateur. La préférence est stockée dans `localStorage` avec trois modes : auto, clair manuel, sombre manuel.

### 8. Trigger PL/pgSQL pour la suppression en cascade
Un trigger PostgreSQL (`trigger_supprimer_messages_utilisateur`) s'exécute avant la suppression d'un enregistrement dans `LOGIN`. Il anonymise les messages de l'utilisateur supprimé (contenu remplacé, auteur réassigné à un utilisateur par défaut), supprime ses résultats QCM et ses informations de profil — garantissant l'intégrité référentielle et la traçabilité.

---

## Extraits de code remarquables

### Extrait 1 — Routeur frontal (front controller)

**Fichier** : `public/index.php`

```php
<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$url = $_SERVER['REQUEST_URI'];
header('Content-Type: text/html; charset=utf-8');
session_start();

if (isset($_GET['action']) && isset($_GET['controller'])) {
    try{
        require '../app/controllers/' . $_GET['controller'] . '.php';
        $_GET['action']();
    } catch (Error $e){
        require '../app/views/404.php';
    }
} else {
    require '../app/views/home.php';
}
```

**Explication** : Ce fichier est le point d'entrée unique de l'application. Il désactive le cache navigateur, démarre la session, puis route la requête en incluant dynamiquement le contrôleur demandé et en appelant la fonction d'action correspondante. En cas d'erreur (contrôleur ou action inexistante), une vue 404 est affichée. Ce pattern de front controller est simple mais efficace pour un projet de cette envergure.

---

### Extrait 2 — Couche d'accès aux données avec PDO

**Fichier** : `app/models/DBManage.php` (extrait, ~694 lignes)

```php
class DBManage
{
    private PDO $dbh;

    public function __construct()
    {
        try {
            $this->dbh = new PDO("pgsql:host=pgsql;dbname=postgres;port=5432", "postgres", "postgres");
        } catch (PDOException $e) {
            echo $e->getMessage();
        }
    }

    public function createUser(string $login, string $password, string $firstname,
                               string $lastname, string $birthdate, string $pseudo): int
    {
        $salt = hash('sha256', random_bytes(32));
        $password = hash('sha256', $password . $salt);
        $sth = $this->dbh->prepare("INSERT INTO login (login, password, salt) VALUES (:login, :password, :salt)");
        $sth->bindParam(":login", $login);
        $sth->bindParam(":password", $password);
        $sth->bindParam(":salt", $salt);
        $sth->execute();

        $sth = $this->dbh->prepare("SELECT id FROM login WHERE login = :login AND password = :password");
        $sth->bindParam(":login", $login);
        $sth->bindParam(":password", $password);
        $sth->execute();
        $id = $sth->fetch(PDO::FETCH_ASSOC)['id'];

        $sth = $this->dbh->prepare("INSERT INTO userinfo (iduser, pseudo, nom, prenom, date_naissance)
                                    VALUES (:id, :pseudo, :lastname, :firstname, :birthdate)");
        $sth->bindParam(":id", $id);
        $sth->bindParam(":firstname", $firstname);
        $sth->bindParam(":lastname", $lastname);
        $sth->bindParam(":birthdate", $birthdate);
        $sth->bindParam(":pseudo", $pseudo);
        $sth->execute();
        // ... logging
        return $id;
    }
```

**Explication** : La classe `DBManage` centralise tout l'accès aux données. Chaque méthode utilise des **requêtes préparées PDO** avec des paramètres bindés, ce qui protège contre les injections SQL. L'approche est procedural-style dans un objet (pas de repository pattern ni d'ORM). La méthode `createUser` illustre un cas intéressant : le mot de passe est salé avec un salt unique avant hashage SHA-256, puis l'utilisateur est créé en deux étapes (table `LOGIN` puis `USERINFO`), récupérant l'ID auto-généré pour lier les deux enregistrements.

---

### Extrait 3 — Trigger PostgreSQL de suppression d'utilisateur

**Fichier** : `db_setup.sql`

```sql
CREATE OR REPLACE FUNCTION supprimer_utilisateur()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
DECLARE
    id_utilisateur INT;
BEGIN
    id_utilisateur = OLD.ID;
    UPDATE MESSAGES SET CONTENT = 'Ce message a été supprimé' WHERE IDAUTEUR = id_utilisateur;
    UPDATE MESSAGES SET IDAUTEUR = 1 WHERE IDAUTEUR = id_utilisateur;
    UPDATE TOPIC SET IDAUTEUR = 1 WHERE IDAUTEUR = id_utilisateur;
    DELETE FROM ADMIN WHERE IDUSER = id_utilisateur;
    DELETE FROM QCMRESULTS WHERE IDUSER = id_utilisateur;
    DELETE FROM USERINFO WHERE IDUSER = id_utilisateur;
    RETURN OLD;
END
$$;

CREATE OR REPLACE TRIGGER trigger_supprimer_messages_utilisateur
    BEFORE DELETE ON LOGIN
    FOR EACH ROW
EXECUTE FUNCTION supprimer_utilisateur();
```

**Explication** : Ce trigger PL/pgSQL s'exécute **avant** chaque suppression dans la table `LOGIN`. Plutôt que de supprimer en cascade les messages de l'utilisateur (ce qui détruirait les fils de discussion), le trigger **anonymise** les contenus et réassigne la paternité à un utilisateur système (ID 1, « Utilisateur supprimé »). Les résultats QCM et le profil sont supprimés. C'est une approche de soft-delete intelligente qui préserve l'intégrité du forum tout en respectant la vie privée.

---

### Extrait 4 — Validation et scoring des QCM

**Fichier** : `app/controllers/qcm.php`

```php
function getQCM()
{
    require_once "../app/models/DBManage.php";
    require_once "../app/models/Utility.php";

    if (isset($_GET['qcmid'])) {
        $qcmid = (int)$_GET['qcmid'];
    } else {
        header('Location: /index.php?controller=cours&action=getCoursPanel');
    }
    $dbc = new DBManage();
    $qcm = $dbc->getQCMById($qcmid);

    if (!$qcm) {
        header("Location: /index.php?controller=user&action=notFound", true, 301);
        exit();
    }

    $path = $qcm->path;
    $questions = [];
    $answers = [];
    $expected_answers = [];

    $xml = file_get_contents($path);
    $file = simplexml_load_string($xml);
    foreach ($file->question as $question) {
        $questions[] = $question->text;
        $expected_answers[] = $question->attributes()->expected;
        $temp_answers = [];
        foreach ($question->answers->answer as $answer) {
            $temp_answers[] = $answer;
        }
        $answers[] = $temp_answers;
    }
    $admin = getUser()->isAdmin;
    require_once "../app/views/qcm.php";
}

function validateQCM(){
    require_once "../app/models/DBManage.php";
    $dbc = new DBManage();
    $qcmid = (int)$_POST['qcmid'];
    $qcm = $dbc->getQCMById($qcmid);

    $file = simplexml_load_file($qcm->path);
    foreach ($file->question as $question) {
        $questions[] = $question->text;
        $expected_answers[] = $question->attributes()->expected;
    }

    $score = 0;
    for ($i = 0; $i < count($questions); $i++) {
        if ($_POST['qcm' . $i] == ($expected_answers[$i] - 1)) {
            $score++;
        }
    }
    $score = $score / count($questions) * 20;
    $dbc->addQCMResult($qcmid, unserialize($_SESSION['userInfo'])->id, $score);
    require_once "../app/views/qcm_note.php";
}
```

**Explication** : Le système de QCM fonctionne en deux temps. D'abord, `getQCM()` charge le fichier XML du QCM, le parse avec `SimpleXMLElement` et extrait les questions, réponses et indices attendus. La vue affiche un formulaire avec des `radio buttons` et un chronomètre JavaScript. Ensuite, `validateQCM()` compare les réponses soumises avec les réponses attendues (attention : l'indice attendu en XML est 1-based, les valeurs du formulaire sont 0-based, d'où le `-1`), calcule un score sur 20 et le persiste. Si l'utilisateur a déjà passé le QCM, le résultat est mis à jour (upsert dans `addQCMResult`).

---

### Extrait 5 — Éditeur de cours avec menu contextuel jQuery

**Fichier** : `public/js/courseCreation.js` (extrait)

```javascript
jQuery(function () {
    $.contextMenu({
        selector: 'div#course', callback: function (key, options) {
            var m = "clicked: " + key;
            window.console && console.log(m) || alert(m);
        }, items: {
            "Titre": {
                name: "Titre", items: {
                    "H1": {
                        name: "H1", icon: "edit", callback: function (key, options) {
                            let div = input('h1');
                            $('#course').append(div);
                            div.find('input').focus();
                        }
                    },
                    "H2": { name: "H2", icon: "edit", callback: function () { /* ... */ } },
                    // ... H3 à H6
                }
            },
            "video": { name: "Vidéo", icon: "edit", callback: function () { /* ... */ } },
            "Paragraphe": { name: "paragraphe", icon: "edit", callback: function () { /* ... */ } },
            "QCM": { name: "QCM", icon: "edit", callback: async function () { /* ... */ } },
            "Image": { name: "Image", icon: "edit", callback: function () { /* ... */ } }
        },
    });
});

const getAllData = () => {
    let data = {};
    data['title'] = $('#courseName').val();
    data['elements'] = [];
    let index = 0;
    $('#course .val').each(function () {
        let value;
        switch ($(this).prop('tagName')) {
            case 'H1': value = {type: 'titre', balise: 'h1', val: $(this).text()}; break;
            case 'P':  value = {type: 'paragraphe', val: $(this).text()}; break;
            case 'IFRAME': value = {type: 'video', balise: 'iframe', val: $(this).attr('src')}; break;
            case 'SELECT': value = {type: 'qcm', val: $(this).val()}; break;
            case 'IMG': value = {type: 'image', val: $(this).attr('src')}; break;
        }
        data['elements'][index] = value;
        index++;
    });
    return data;
}
```

**Explication** : L'éditeur de cours est l'un des composants les plus sophistiqués du projet. Il utilise le plugin `jquery-contextmenu` pour offrir un menu au clic droit avec ajout de titres (H1-H6), paragraphes, images, vidéos YouTube et QCM intégrés. Chaque bloc est éditable puis validable (conversion en élément en lecture seule, double-clic pour ré-éditer). La fonction `getAllData()` parcourt le DOM pour collecter tous les éléments validés (classe `.val`) et les sérialise en JSON structuré, envoyé au serveur via AJAX. Ce pattern d'éditeur DOM-first est remarquable pour un projet étudiant.

---

### Extrait 6 — Système de thème UI adaptatif

**Fichier** : `public/js/UI_Theme.js` (extrait)

```javascript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (localStorage.getItem("dark-mode") === "auto") {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.style.backgroundColor = dark_color;
            document.documentElement.style.setProperty("--body-background-color",
                getComputedStyle(document.documentElement).getPropertyValue('--body-background-dark'));
        } else {
            document.body.style.backgroundColor = light_color;
            document.documentElement.style.setProperty("--body-background-color",
                getComputedStyle(document.documentElement).getPropertyValue('--body-background-light'));
        }
    }
});

function ModeAuto() {
    localStorage.setItem("dark-mode", "auto");
    if (navBar) {
        if (bouton_mode_automatique.checked) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.style.backgroundColor = dark_color;
                document.documentElement.style.setProperty("--body-background-color",
                    getComputedStyle(document.documentElement).getPropertyValue('--body-background-dark'));
            } else {
                document.body.style.backgroundColor = light_color;
                document.documentElement.style.setProperty("--body-background-color",
                    getComputedStyle(document.documentElement).getPropertyValue('--body-background-light'));
            }
            bouton_mode_sombre.checked = false;
        } else {
            ModeClair();
        }
    }
    // ...
}
```

**Explication** : Le système de thème gère trois états (`auto`, `manuel:light`, `manuel:dark`) persistés dans `localStorage`. En mode auto, il écoute les changements de préférence du système via `matchMedia('(prefers-color-scheme: dark)')` et réagit en temps réel. Les couleurs sont définies via des variables CSS personnalisées dans `UI_Theme.css` (`--body-background-light: #4451dd`, `--body-background-dark: #333336`), ce qui permet de changer le thème sans rechargement de page.

---

### Extrait 7 — Validation de formulaire d'inscription côté client

**Fichier** : `public/js/userCreate.js` (extrait)

```javascript
function isFormValid() {
    var isValid = true;

    if ($("#mail")[0].value != $("#mail-confirm")[0].value) {
        isValid = false;
        document.getElementById("mail-confirm").style.boxShadow = "0 0 10px rgb(255, 0, 0)";
    } else {
        document.getElementById("mail-confirm").style.boxShadow = "none";
    }

    if (!isPasswordStrong()) {
        isValid = false;
    } else if ($("#password")[0].value != $("#password-confirm")[0].value) {
        isValid = false;
        document.getElementById("password-confirm").style.boxShadow = "0 0 10px rgb(255, 0, 0)";
    } else {
        document.getElementById("password-confirm").style.boxShadow = "none";
    }

    if ($("#username")[0].value.length <= 3 || $("#username")[0].value.length >= 20) {
        isValid = false;
    }

    // Date de naissance : vérifie que l'utilisateur a entre 6 et 110 ans
    if (($("#birthdate")[0].value.length >= 1)) {
        let DateDeNaissance = new Date(Date.parse($("#birthdate")[0].value));
        if (!(isNaN(DateDeNaissance))) {
            if (Date.now() <= DateDeNaissance) {
                isValid = false;
            } else {
                var diff = Date.now() - DateDeNaissance.getTime();
                var age = new Date(diff);
                var User_Age = Math.abs(age.getUTCFullYear() - 1970);
                if (User_Age > 110 || User_Age < 6) {
                    isValid = false;
                    document.getElementById("birthdate").style.boxShadow = "0 0 10px rgb(255, 0, 0)";
                } else {
                    document.getElementById("birthdate").style.boxShadow = "none";
                }
            }
        }
    }
    return isValid;
}
```

**Explication** : La validation côté client est exhaustive : confirmation d'e-mail et de mot de passe, longueur du pseudo (4-19 caractères), vérification de l'âge (6-110 ans), force du mot de passe. Chaque champ invalide est souligné en rouge via `boxShadow`. De plus, des vérifications d'unicité (pseudo et e-mail) sont effectuées en AJAX asynchrone au `focusout` grâce aux fonctions `pseudoExist()` et `emailExist()` définies dans `utility.js`. Cette combinaison de validation synchrone et asynchrone offre un bon retour utilisateur immédiat.

---

## Qualité, sécurité, maintenance

### Sécurité
- **Requêtes préparées** : toutes les requêtes SQL utilisent `PDO::prepare()` avec des paramètres bindés — protection effective contre les injections SQL.
- **Hash des mots de passe** : SHA-256 avec salt unique par utilisateur (`random_bytes(32)`). Fonctionnel mais pas conforme aux recommandations actuelles (bcrypt, Argon2).
- **Sessions** : les données utilisateur sérialisées sont stockées en session PHP (`$_SESSION['userInfo']`).
- **Contrôle d'accès** : les pages d'administration vérifient `$user->isAdmin` avant tout rendu ; les opérations de suppression dans le forum vérifient l'appartenance de l'utilisateur ou son statut admin.
- **Logging** : événements clés (connexions, créations de comptes/topics/posts, QCM réalisés) journalisés dans un fichier texte (`adminPanel/Log.txt`) avec timestamps microsecondes.

### Qualité du code
- **Documentation** : la plupart des méthodes de `DBManage` sont documentées avec des blocs PHPDoc.
- **Cohérence** : la séparation MVC est globalement respectée, bien que certaines vues contiennent de la logique métier (requêtes DB directement dans les templates).
- **Absence de tests** : aucun test unitaire ou d'intégration automatisé n'est présent.
- **Pas de CI/CD** : aucun pipeline d'intégration continue configuré.

### Points de vigilance
- Les credentials de la base de données sont codés en dur dans `DBManage.php` (hôte, nom, utilisateur, mot de passe).
- Le routage par inclusion dynamique (`require '../app/controllers/' . $_GET['controller'] . '.php'`) expose une surface d'attaque potentielle si le serveur web ne limite pas les traversées de chemin.
- Le mot de passe des utilisateurs générés aléatoirement est codé en dur (`"123456789"`).

---

## Installation et exécution (local)

### Prérequis
- **Docker** (pour PostgreSQL)
- **PHP** ≥ 8.0 avec l'extension `pdo_pgsql`
- **PostgreSQL** client (pour exécuter le script d'initialisation)
- **ffmpeg** (optionnel, pour le redimensionnement des photos de profil)
- Un serveur web (Apache/Nginx) ou le serveur intégré PHP

### Étapes

```bash
# 1. Cloner le dépôt
git clone <repo-url> Projet-DAW && cd Projet-DAW

# 2. Lancer PostgreSQL dans un conteneur Docker
docker run -d \
  --name pgsql \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  --add-host=pgsql:127.0.0.1 \
  postgres

# 3. Initialiser la base de données
psql -h localhost -U postgres -d postgres -f db_setup.sql

# 4. Lancer le serveur PHP intégré (depuis le dossier public/)
cd public
php -S localhost:8080

# 5. Accéder à l'application
# Ouvrir http://localhost:8080 dans un navigateur
```

> **Note** : L'hôte PostgreSQL attendu par le code est `pgsql` (nom Docker). Pour un usage local sans Docker, modifier la chaîne de connexion dans `app/models/DBManage.php` pour pointer vers `localhost`.

---

## Limites connues et pistes d'amélioration

1. **Hashing des mots de passe** : migrer de SHA-256 + salt vers `password_hash()` (bcrypt/Argon2), intégré nativement à PHP.
2. **Configuration externalisée** : extraire les credentials DB et les paramètres dans un fichier `.env` (via `vlucas/phpdotenv` par exemple).
3. **Sécurisation du routage** : valider et whitelist les noms de contrôleurs/actions pour éviter les inclusions arbitraires.
4. **Tests** : ajouter des tests unitaires (PHPUnit) sur les méthodes de `DBManage` et des tests d'intégration sur les contrôleurs.
5. **ORM ou Query Builder** : remplacer les requêtes SQL écrites manuellement par un Query Builder ou un ORM léger (ex. Eloquent standalone) pour réduire le code boilerplate.
6. **Séparation des responsabilités** : certaines vues contiennent trop de logique métier ; extraire les requêtes DB des templates vers les contrôleurs.
7. **API REST** : séparer le backend PHP du frontend pour permettre une évolution vers une SPA (React/Vue) ou une application mobile.
8. **Internationalisation** : le contenu est entièrement en français dur ; un système d'i18n faciliterait l'ouverture à d'autres langues.
9. **Upload sécurisé** : la gestion des photos de profil via `exec(ffmpeg ...)` est une surface d'attaque ; privilégier les bibliothèques PHP natives (GD, Imagick).

---

## Liens

- **Repo local** : `/Users/sr-71/Documents/portfolio/repos_to_process/Projet-DAW`
- **Licence** : MIT (Copyright 2023 Yoan Dusoleil)
