# Leafium | Rapport technique

## En bref

- **Problème adressé** : centraliser et analyser des données cinématographiques (films, cinémas, diffusions, ventes) dans une base NoSQL afin d'en extraire des indicateurs décisionnels.
- **Ce que ça fait** : peuplement automatisé d'une base MongoDB, exécution de pipelines d'agrégation complexes et génération de visualisations (barres, camemberts) via Matplotlib.
- **Stack clé** : Python 3.10+, MongoDB 6 (via Docker), PyMongo, Matplotlib.
- **Point différenciant** : utilisation intensive des *JSON Schema validators* MongoDB côté serveur pour garantir l'intégrité de documents imbriqués profondément (cinéma → salles → diffusions → film), combinée à 18 requêtes d'analyse documentées couvrant `find`, `aggregate`, `mapReduce` et `updateOne`.

---

## Contexte et objectif

Leafium est un projet académique conçu dans le cadre d'un cours sur les bases de données NoSQL. L'objectif est de modéliser, alimenter et interroger une base MongoDB dédiée à l'exploitation cinématographique. Les données couvrent les films (titre, réalisateurs, catégories, commentaires/notations), les cinémas (adresse, salles, capacités) et les séances de diffusion (film projeté, prix, tickets vendus).

Le projet vise à démontrer la maîtrise de :

- la **conception de schémas NoSQL** avec validation serveur ;
- les **pipelines d'agrégation** MongoDB (`$unwind`, `$group`, `$project`, `$map`, `$sort`, `$limit`) ;
- l'**intégration Python–MongoDB** via PyMongo ;
- la **visualisation de données** avec Matplotlib.

Le public cible est un ensemble de cinémas d'une ville (Paris et Dijon dans les données de démonstration), avec des analyses allant du global (tous cinémas confondus) au ciblé (un film, un réalisateur, une catégorie).

---

## Fonctionnalités

### Gestion des données

| Fonctionnalité | Description |
|---|---|
| **Création de collections validées** | Les collections `films` et `cinemas` sont créées avec un `$jsonSchema` imposant types et champs requis |
| **Peuplement automatique** | Génération de *N* films aléatoires (titres, réalisateurs, catégories, commentaires) et de cinémas réels avec salles et diffusions fictives |
| **CRUD complet** | Fonctions `get`, `get_one`, `insert`, `insert_many`, `update`, `delete_many` encapsulant les opérations PyMongo |

### Requêtes analytiques (pipelines d'agrégation)

| Requête | Pipeline clé |
|---|---|
| Note moyenne par film (top N) | `$unwind` comments → `$group` + `$avg` |
| Films par catégorie / réalisateur | `$match` → `$project` → `$sort` |
| Total de tickets vendus | Double `$unwind` (rooms → broadcasts) → `$group` + `$sum` |
| Top films par tickets | `$group` par film avec `$first` et `$sum` |
| Top cinémas par tickets | `$group` par cinéma avec `$sum` |
| Films sous un prix donné | `$match` sur prix + `$group` |
| Suppression par réalisateur | `delete_many` sur champ tableau `directors` |

### Visualisations

- **Diagrammes en barres** : top films par note moyenne, films sous un certain prix.
- **Camemberts** : parts de marché des tickets vendus par film et par cinéma.

### Documentation SQL-like

Le dossier `requete/requetes.md` documente **18 requêtes MongoDB** en syntaxe shell JavaScript, allant du simple `find` au `mapReduce` en passant par des agrégations multi-étapes.

---

## Architecture (vue d'ensemble)

```
Leafium/
├── src/
│   ├── main.py          # Point d'entrée : connexion, peuplement, exécution des requêtes
│   ├── database.py      # Classe Database : CRUD, agrégations, visualisation
│   └── data.py          # Données statiques (titres, réalisateurs, cinémas, commentaires)
├── requete/
│   ├── requetes.md      # 18 requêtes MongoDB documentées (syntaxe shell)
│   ├── films.md         # Schéma de validation de la collection films
│   ├── cinemas.md       # Schéma de validation de la collection cinemas
│   └── connexion        # Instructions de connexion SSH au serveur IEM
├── documentation/
│   ├── Documentation.pdf  # Documentation Doxygen générée
│   ├── Doxyfile           # Configuration Doxygen
│   ├── json/              # Exemples de documents JSON
│   ├── uml/               # Diagrammes DrawIO (relationnel, vue d'ensemble)
│   └── img/               # Captures d'écran et logo
├── docker-compose.yml   # Service MongoDB 6 avec volume persistant
├── .gitignore
└── README.md
```

### Flux de données

1. **Connexion** : `main.py` → `connection()` → instancie `Database(host, port, db, user, password)`.
2. **Initialisation** : `drop_collection()` supprime les collections existantes, puis `populate(N)` crée les collections avec validation et insère *N* films + tous les cinémas.
3. **Analyse** : chaque méthode de requête construit un pipeline d'agrégation, exécute `.aggregate()`, puis affiche les résultats en console (ANSI coloré) et/ou en graphique Matplotlib.
4. **Persistance** : les données résident dans le volume Docker `leafium`, survivant aux redémarrages du conteneur.

### Modèle de données

Deux collections MongoDB :

- **`films`** : documents plats avec tableaux imbriqués (`directors`, `categories`, `comments` avec auteur, contenu, note).
- **`cinemas`** : documents profondément imbriqués — `address` (objet) + `rooms[]` (tableau) → chaque room contient `broadcasts[]` → chaque diffusion référence un film par `{_id, name}` et inclut date, prix, tickets vendus.

Ce modèle illustre le compromis NoSQL classique entre **dénormalisation contrôlée** (le film est référencé dans la diffusion, pas dupliqué intégralement) et **imbrication** (les salles et diffusions sont des sous-documents).

---

## Choix techniques et raisons

### 1. MongoDB avec validation de schéma `$jsonSchema`

Contrairement à l'image répandue du NoSQL « schema-less », Leafium utilise les validateurs natifs de MongoDB pour imposer des contraintes strictes (`bsonType`, `required`) dès la création de la collection. Ce choix garantit l'intégrité des données insérées sans recourir à un ORM.

### 2. Pipelines d'agrégation plutôt que MapReduce

Le projet documente une requête `mapReduce` (requête 16) mais l'accompagne d'une note : l'agrégation est recommandée en remplacement, car plus performante et plus maintenable dans les versions récentes de MongoDB. Toutes les autres requêtes utilisent `.aggregate()`.

### 3. Docker pour la reproductibilité

Le `docker-compose.yml` définit un seul service `mongodb` basé sur `mongo:6-jammy` avec un volume nommé. Cela élimine les problèmes d'installation locale et assure un environnement identique entre développeurs.

### 4. Séparation données / logique

Le fichier `data.py` isole les jeux de données statiques (titres, réalisateurs, catégories, cinémas réels parisiens et dijonnais, commentaires types). Cette séparation facilite le remplacement des données de test sans toucher à la logique métier.

### 5. Génération aléatoire contrôlée

La méthode `populate()` construit des documents aléatoires mais réalistes : durées entre 60 et 160 minutes, prix entre 5 et 15, tickets vendus bornés par la capacité de la salle. Cela produit des données de démonstration utilisables immédiatement.

### 6. Visualisation intégrée

Chaque requête analytique produit non seulement un affichage console coloré (codes ANSI) mais aussi un graphique Matplotlib (`plt.show()`). Ce choix rend les résultats immédiatement compréhensibles sans outil externe.

### 7. Documentation Doxygen

Un `Doxyfile` est fourni pour générer la documentation de l'API Python au format HTML/PDF. Cela dénote une attention à la maintenabilité et à la lisibilité du code.

---

## Extraits de code remarquables

### Extrait 1 — Schéma de validation JSON de la collection `cinemas`

**Fichier** : `src/database.py` (lignes 36–123)

```python
self.db.create_collection("cinemas", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["name", "address", "rooms"],
        "properties": {
            "name": {
                "bsonType": "string",
                "description": "Nom du cinéma"
            },
            "address": {
                "bsonType": "object",
                "required": ["city", "number", "street", "zip"],
                "properties": {
                    "city":    {"bsonType": "string"},
                    "number":  {"bsonType": "int"},
                    "street":  {"bsonType": "string"},
                    "zip":     {"bsonType": "int"}
                }
            },
            "rooms": {
                "bsonType": "array",
                "items": {
                    "bsonType": "object",
                    "required": ["name", "capacity", "broadcasts"],
                    "properties": {
                        "name":      {"bsonType": "string"},
                        "capacity":  {"bsonType": "int"},
                        "broadcasts": {
                            "bsonType": "array",
                            "items": {
                                "bsonType": "object",
                                "required": ["film", "date_broadcast", "price", "ticket_sold"],
                                "properties": {
                                    "film": {
                                        "bsonType": "object",
                                        "required": ["name", "_id"],
                                        "properties": {
                                            "_id":   {"bsonType": "objectId"},
                                            "name":  {"bsonType": "string"}
                                        }
                                    },
                                    "date_broadcast": {"bsonType": "string"},
                                    "price":          {"bsonType": "int"},
                                    "ticket_sold":    {"bsonType": "int"}
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
```

**Pourquoi c'est intéressant** : Ce schéma montre une validation sur trois niveaux d'imbrication (`cinemas → rooms → broadcasts`). Chaque niveau impose des types BSON précis et des champs obligatoires. Toute insertion qui ne respecterait pas cette structure serait rejetée par MongoDB, ce qui constitue une garantie d'intégrité analogue à celle d'une base relationnelle, tout en conservant la flexibilité du modèle documentaire.

---

### Extrait 2 — Pipeline d'agrégation : top films par tickets vendus + camembert

**Fichier** : `src/database.py` (lignes 450–490)

```python
def get_top_movies_by_tickets_sold(self, limit: int):
    try:
        if self.db is None:
            raise ValueError("Erreur de connexion à la base de données")

        pipeline = [
            {"$unwind": "$rooms"},
            {"$unwind": "$rooms.broadcasts"},
            {"$group": {"_id": "$rooms.broadcasts.film._id",
                        "name": {"$first": "$rooms.broadcasts.film.name"},
                        "total_tickets_sold": {"$sum": "$rooms.broadcasts.ticket_sold"}}},
            {"$sort": {"total_tickets_sold": -1}},
            {"$limit": limit}
        ]

        data = list(self.db["cinemas"].aggregate(pipeline))
        titles = [movie['name'] for movie in data]
        tickets_sold = [movie['total_tickets_sold'] for movie in data]

        print(f"Les {limit} films ayant vendu le plus de tickets sont:")
        for i in range(len(titles)):
            title = f"\033[92m{titles[i]}\033[0m"
            tickets_sold_text = f"{'tickets vendus' if tickets_sold[i] > 1 else 'ticket vendu'}"
            print(f"{title} avec \033[94m{tickets_sold[i]}\033[0m {tickets_sold_text}")

        sum_tickets_sold = sum(tickets_sold)
        total_tickets_sold = self.get_total_tickets_sold()
        title_string = ("Diagramme des parts de marché des "
                        + str(total_tickets_sold) + " tickets vendus par film")
        valeurs = tickets_sold + [self.get_total_tickets_sold() - sum_tickets_sold]
        etiquettes = titles + ['Autres']
        plt.pie(valeurs, labels=etiquettes, autopct='%1.1f%%', startangle=90)
        plt.title(title_string)
        plt.show()

    except Exception as e:
        print(f"Erreur lors de la récupération des données: {e}")
        return None
```

**Pourquoi c'est intéressant** : Ce pipeline illustre le déroulement d'un tableau imbriqué à deux niveaux (`rooms` puis `broadcasts`) suivi d'un regroupement sur l'ID du film référencé dans la diffusion. L'accumulateur `$first` récupère le nom du film, `$sum` agrège les tickets. La visualisation en camembert complète automatiquement avec une catégorie « Autres » calculée par différence avec le total — un détail UX qui montre une pensée au-delà du simple exercice technique.

---

### Extrait 3 — Connexion flexible avec gestion d'erreurs

**Fichier** : `src/main.py` (lignes 1–67)

```python
from time import sleep
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from database import Database


def connection():
    """
    Connection à la base de données MongoDB en local ou sur le serveur de l'IEM
    :return:
    """
    host = "localhost"
    port = 27017
    database = "leafium"
    user = None
    password = None

    iem = input("Se connecter à \033[92ml'IEM ?\033[97m (y/n)\n")
    if iem == "y":
        user = input("Indiquer le \033[92mnom d'utilisateur\033[97m\n") or ""
        try:
            host = "mongo2.iem"
            return Database(host, port, user, user, user)
        except ConnectionFailure as e:
            print("\033[91mServeur non disponible\033[97m ->", e)
            exit(1)
    else:
        try:
            host = input(
                "Appuyez sur Entrée pour vous connecter en \033[92mlocal\033[97m "
                "ou indiquez l'adresse du serveur\n") or host
            port = input(
                "Apuyer sur Entrée pour se connecter au port \033[92m27017\033[97m "
                "ou indiquer le port du serveur\n") or port
            database = input(
                "Apuyer sur Entrée pour se connecter à la base de données \033[92mleafium\033[97m "
                "ou indiquer le nom de la base de données\n") or database
            user = input(
                "Apuyer sur Entrée pour vous connecter \033[92msans utilisateur\033[97m "
                "ou indiquer le nom de l'utilisateur\n") or user
            if user:
                password = input("Indiquer le \033[92mmot de passe\033[97m de l'utilisateur\n")
            return Database(host, port, database, user, password)
        except ConnectionFailure as e:
            print("\033[91mServeur non disponible\033[97m ->", e)
            exit(1)


if __name__ == '__main__':
    try:
        db = connection()
        sleep(1)
        print("\033[92m*** Connexion réussie à", db.host, "sur le port",
              db.port, "en tant que", db.user, "***\033[97m")
        db.drop_collection()
        db.populate(1000)
        db.get_average_rating_by_movie(5)
        db.get_movie_by_category("Action")
        print(f"Le nombre total de tickets vendus est de "
              f"\033[92m{db.get_total_tickets_sold()}\033[0m")
        db.get_movie_by_director("Steven Spielberg")
        db.get_top_movies_by_tickets_sold(5)
        db.get_top_cinema_by_tickets_sold(5)
        db.get_movie_name_under_price(15, 10)
        db.delete_films_with_director("Steven Spielberg")
    except Exception as e:
        print("\033[91mServeur non disponible\033[97m ->", e)
        exit(1)
```

**Pourquoi c'est intéressant** : Le point d'entrée offre une configuration interactive avec valeurs par défaut sensées (localhost:27017, base `leafium`), un branchement vers le serveur académique (IEM), et une capture de `ConnectionFailure` à chaque tentative. Le bloc principal exécute une séquence complète de démo : reset → peuplement de 1 000 films → 8 requêtes de natures différentes. Les codes ANSI (`\033[92m`, `\033[91m`) améliorent la lisibilité terminal.

---

### Extrait 4 — Requête d'agrégation complexe : chiffre d'affaires par cinéma (shell MongoDB)

**Fichier** : `requete/requetes.md` (requête 6)

```javascript
db.cinemas.aggregate([{
    $project: {
        _id: 0,
        name: 1,
        chiffre_affaire: {
            $sum: {
                $map: {
                    input: "$rooms",
                    as: "room",
                    in: {
                        $sum: {
                            $map: {
                                input: "$$room.broadcasts",
                                as: "broadcast",
                                in: {
                                    $multiply: ["$$broadcast.ticket_sold", "$$broadcast.price"]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}])
```

**Pourquoi c'est intéressant** : Cette requête utilise `$map` imbriqué sur deux niveaux de tableaux (`rooms` → `broadcasts`) pour calculer le chiffre d'affaires de chaque cinéma sans recourir à `$unwind`. C'est une alternative fonctionnelle aux pipelines multi-étapes, plus concise mais moins lisible pour des pipelines complexes. Le projet documente les deux approches (celle-ci et la version `$unwind`/`$group`), ce qui est pédagogiquement pertinent.

---

### Extrait 5 — Peuplement avec données aléatoires contraintes

**Fichier** : `src/database.py` (lignes 204–259)

```python
def populate(self, film: int):
    # Création des collections films et cinemas
    list_collection_names = self.db.list_collection_names()
    if not ("films" in list_collection_names and "cinemas" in list_collection_names):
        self.create_collection_cinemas()
        self.create_collection_films()
        sleep(1)

    # Insertion des films
    for i in range(film):
        self.insert_film({
            "release_date": f"20{math.floor(random.random() * 24)}-01-01",
            "title": titres_de_films[math.floor(random.random() * len(titres_de_films))],
            "duration": math.floor(random.random() * 100) + 60,
            "description": ''.join(random.choice('abcdefghijklmnopqrstuvyxyz')
                                   for _ in range(100)),
            "directors": [realisateurs_de_films[math.floor(random.random()
                            * len(realisateurs_de_films))] for _ in
                          range(math.floor(random.random() * 3))],
            "categories": [genres_de_films[math.floor(random.random()
                            * len(genres_de_films))] for _ in
                           range(math.floor(random.random() * 10))],
            "comments": [{
                "author": users[math.floor(random.random() * len(users))],
                **commentaires_et_notes_de_films[
                    math.floor(random.random() * len(commentaires_et_notes_de_films))]
            } for _ in range(math.floor(random.random() * film))]
        })

    # Récupération des IDs insérés pour référencement dans les cinémas
    films_id_list = [{"_id": film["_id"], "name": film["title"]}
                     for film in self.get_films({}, {"_id": 1, "title": 1})]

    for cinama in cinemas:
        capacity = math.floor(random.random() * 500)
        self.insert_cinema({
            **cinama,
            "rooms": [{
                "name": f"room{i}",
                "capacity": capacity,
                "broadcasts": [{
                    "film": films_id_list[math.floor(random.random() * len(films_id_list))],
                    "date_broadcast": f"{math.floor(random.random() * 30)}/"
                                      f"{math.floor(random.random() * 12)}/"
                                      f"20{math.floor(random.random() * 24)} "
                                      f"{math.floor(random.random() * 14 + 10)}:00:00",
                    "price": math.floor(random.random() * 10) + 5,
                    "ticket_sold": math.floor(random.random() * capacity)
                } for _ in range(math.floor(random.random() * 100))]
            } for i in range(math.floor(random.random() * 10))]
        })
```

**Pourquoi c'est intéressant** : La logique de peuplement respecte les contraintes du schéma : les tickets vendus ne dépassent jamais la capacité de la salle (`random * capacity`), les références de film utilisent les ObjectId réels générés par MongoDB lors de l'insertion (`films_id_list`). L'opérateur `**` (déballage de dictionnaire) est utilisé proprement pour fusionner les données statiques du cinéma avec les salles générées dynamiquement.

---

### Extrait 6 — MapReduce (approche dépréciée, documentée pour comparaison)

**Fichier** : `requete/requetes.md` (requête 16)

```javascript
db.cinemas.mapReduce(
    function () {
        this.rooms.forEach(function (room) {
            var nb_ticket = 0;
            room.broadcasts.forEach(function (broadcast) {
                nb_ticket += broadcast.ticket_sold;
            });
            emit(this.name, nb_ticket);
        });
    },
    function (key, values) {
        return Array.sum(values);
    },
    { out: "nb_ticket" }
)
```

**Pourquoi c'est intéressant** : Le projet documente cette approche `mapReduce` avec un commentaire explicite : « Cette fonction est plus lente que l'agrégation mais elle est plus flexible. Dans les nouvelles versions de MongoDB, il est recommandé d'utiliser l'agrégation à la place de `mapReduce` car elle est notée comme dépréciée. » Cette mention montre une conscience des évolutions de la plateforme et une capacité à comparer les approches.

---

## Qualité, sécurité, maintenance

### Tests

Le projet ne comporte pas de suite de tests automatisés (pas de `pytest`, `unittest` ni de dossier `tests/`). Les vérifications se font via l'exécution manuelle du script principal.

### Lint / format

Aucune configuration de linting (`flake8`, `black`, `pylint`) ou de formatage n'est présente. Le code reste lisible grâce à un style cohérent et des docstrings régulières.

### CI

Aucun pipeline CI/CD n'est configuré.

### Gestion d'erreurs

Chaque méthode de requête encapsule son exécution dans un bloc `try/except` avec vérification préalable de `self.db is None`. Les erreurs de connexion sont interceptées via `pymongo.errors.ConnectionFailure`. L'affichage des erreurs utilise des codes ANSI rouges pour une visibilité immédiate en terminal.

### Validation des données

Le point fort du projet est la **validation côté serveur** via `$jsonSchema`. C'est une approche robuste qui empêche toute insertion non conforme, indépendamment du client utilisé.

### Documentation

- **Doxyfile** configuré pour générer la documentation de l'API Python.
- **Documentation.pdf** : documentation Doxygen générée (index des classes, fonctions membres, paramètres).
- **requete/requetes.md** : 18 requêtes MongoDB expliquées pas à pas en français.
- **films.md / cinemas.md** : schémas de validation documentés.
- **Diagrammes UML** : fichiers `.drawio` pour le modèle relationnel et la vue d'ensemble.

### Sécurité

Le fichier `requete/connexion` et le constructeur de `Database` contiennent des identifiants codés en dur pour le serveur académique (`mc150904`). C'est acceptable dans un contexte pédagogique mais serait à éviter en production (variables d'environnement, vault).

---

## Installation et exécution (local)

### Prérequis

- Python ≥ 3.10
- MongoDB ≥ 4.4 (ou Docker)
- Dépendances Python : `pymongo`, `matplotlib`

### Avec Docker (recommandé)

```bash
# Lancer le conteneur MongoDB
docker-compose up -d

# Installer les dépendances Python
pip install pymongo matplotlib

# Exécuter le programme
cd src/
python3 main.py
```

### Sans Docker

Assurez-vous que MongoDB tourne sur `localhost:27017`, puis :

```bash
cd src/
python3 main.py
```

Le programme est interactif : il demande le mode de connexion (local ou serveur IEM) au démarrage, avec des valeurs par défaut validées par simple appui sur Entrée.

### Commandes Docker utiles

```bash
docker-compose up -d      # Créer et démarrer le conteneur
docker-compose start       # Démarrer un conteneur existant
docker-compose stop        # Arrêter le conteneur
docker-compose down        # Supprimer le conteneur (les données persistent dans le volume)
```

---


## Liens

- **GitHub** : [https://github.com/Sudo-Rahman/Leafium](https://github.com/Sudo-Rahman/Leafium)
- **Auteurs** : [Maxime-Cllt](https://github.com/Maxime-Cllt), [Sudo-Rahman](https://github.com/Sudo-Rahman)
