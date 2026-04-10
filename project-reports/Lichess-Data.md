# Lichess-Data | Rapport technique

## En bref

- **Problème adressé** : exploration et analyse de masses de données d'échecs (fichiers PGN Lichess pouvant dépasser 100 Go) via une architecture client-serveur Java.
- **Ce que ça fait** : serveur multi-clients qui indexe des parties d'échecs dans des `ConcurrentHashMap` (par joueur, Elo, date, ouverture, nombre de coups) et répond à 10 types de requêtes — de la recherche de parties au calcul de PageRank.
- **Technologies clés** : Java 17, sockets TCP bruts, sérialisation Java (`Externalizable`), multi-threading natif (`ConcurrentHashMap`, sémaphores personnalisés), format PGN.
- **Point différenciant** : indexation parallèle multi-thread de fichiers PGN volumineux avec persistance des index sur disque (fichiers `.hashmap`), et implémentation d'un algorithme de PageRank adapté aux graphes de victoires aux échecs.

---

## Contexte et objectif

Ce projet a été réalisé dans le cadre d'un cours d'informatique (INFO-4B) par Yilmaz Rahman (et Colliat Maxime sur la classe `PartiesFile`). L'objectif est de fournir un outil capable d'ingérer et d'interroger les bases de données publiques de parties d'échecs diffusées par Lichess sur [database.lichess.org](https://database.lichess.org/).

Les fichiers PGN (Portable Game Notation) de Lichess contiennent des millions de parties et pèsent de plusieurs gigaoctets à plusieurs dizaines de gigaoctets. Le projet vise à rendre ces données interrogeables en temps réel par plusieurs clients simultanés, via un serveur dédié. Il s'agit à la fois d'un exercice de traitement de données volumineuses, d'architecture réseau et de programmation concurrentielle.

---

## Fonctionnalités

Le client connecté au serveur dispose de 10 opérations :

| Choix | Description |
|-------|-------------|
| **0** | Quitter le mode itératif (naviguer vers le niveau de filtrage précédent) |
| **1** | Consulter des parties spécifiques (filtrées par premier coup, Elo, ou date), avec visualisation pas à pas |
| **2** | Trouver toutes les parties d'un joueur donné |
| **3** | Consulter les 5 ouvertures les plus jouées |
| **4** | Consulter les parties terminées en exactement *n* coups |
| **5** | Lister les joueurs les plus actifs (sur le mois complet et semaine par semaine) |
| **6** | Calculer le joueur le plus fort au sens du PageRank |
| **7** | Trouver le plus grand nombre de coups consécutifs communs à *p* parties |
| **8** | Afficher toutes les parties (limité à 100 000) |
| **9** | Afficher le nombre total de parties dans le fichier |
| **-1** | Quitter le serveur |

Les recherches de type 1, 2 et 4 supportent un **mode itératif** : après une première recherche, le client peut affiner ses critères sur le sous-ensemble de parties trouvé, en créant un nouvel index secondaire persisté sur disque.

---

## Architecture (vue d'ensemble)

Le projet est structuré en **trois modules IntelliJ** (et anciennement Maven) formant un graphe de dépendances simple :

```
Projet-INFO-4B
├── Dependance/          ← bibliothèque partagée (Client + Serveur)
│   └── src/
│       ├── client/info/ClientInfo.java
│       ├── semaphore/Semaphore.java
│       └── utils/{Colors.java, Log.java}
├── Client/              ← module client (dépend de Dependance)
│   └── src/
│       ├── client/Client.java
│       ├── main/MainClient.java
│       └── META-INF/MANIFEST.MF
└── Serveur/             ← module serveur (dépend de Dependance)
    └── src/
        ├── choix/InitChoix.java
        ├── main/MainServeur.java
        ├── maps/{CreeMap, CreeMapIteration, CreeMapsOrRead, MapsObjet}.java
        ├── partie/{Partie, PartiesFile}.java
        ├── recherche/
        │   ├── {Recherche, RecherchePartieSpecifique}.java
        │   ├── autres/
        │   │   ├── AfficheToutesLesParties.java
        │   │   ├── CinqOuverturesPlusJoue.java
        │   │   ├── JoueursLesplusActifs.java
        │   │   ├── NbCoupsConsecutifsParties.java
        │   │   └── pagerank/{Noeud, PageRank}.java
        │   └── partie/specifique/
        │       ├── RechercheEnFonctionDate.java
        │       ├── RechercheEnFonctionDuNombreDeCoup.java
        │       ├── RechercheEnFonctionEloJoueur.java
        │       ├── RechereEnFonctionDuPremierCoup.java
        │       └── RecherchePartieJoueur.java
        ├── serveur/{Serveur, ConnexionClient}.java
        └── META-INF/MANIFEST.MF
```

### Flux de données

1. **Démarrage serveur** — `MainServeur` détecte les fichiers `.pgn` dans `data/`, configure le port et le nombre max de clients, puis lance `Serveur`.
2. **Indexation** — `CreeMapsOrRead` vérifie si un fichier `.hashmap` (index sérialisé) existe. Si oui, il le désérialise via `MapsObjet.readExternal()`. Sinon, `CreeMap.createMaps()` découpe le fichier PGN en tranches égales, une par thread, et remplit cinq `ConcurrentHashMap` simultanément. L'index est ensuite sérialisé pour les prochains démarrages.
3. **Connexion client** — `Serveur.accept()` crée un `ConnexionClient` (extends `Thread`) qui reçoit un `ClientInfo` sérialisé, attend la fin du chargement des maps, puis instancie `InitChoix`.
4. **Traitement des requêtes** — `InitChoix` lit le choix du client et délègue à la sous-classe de `Recherche` appropriée. Chaque recherche utilise les hashmaps comme index pour récupérer les positions fichier (`List<Long>`) puis instancie les objets `Partie` à la demande via `PartiesFile`.
5. **Itération** — Si le client choisit de réitérer, `CreeMapIteration` crée un nouvel index restreint aux positions sélectionnées, qui est persisté dans un fichier `.hashmap` dédié.

---

## Choix techniques et raisons

### 1. Indexation par positions octet plutôt que chargement en mémoire

Au lieu de désérialiser l'intégralité du fichier PGN en objets `Partie` (ce qui nécessiterait une mémoire considérable pour des dizaines de millions de parties), le serveur construit des **hashmaps associant des clés (nom, Elo, date, ouverture, nombre de coups) à des listes de positions en octets** dans le fichier. Les objets `Partie` ne sont instanciés que lorsqu'une requête client les demande, via `FileInputStream.getChannel().position(pos)`.

### 2. `ConcurrentHashMap` et multi-threading pour l'indexation

`CreeMap` divise le fichier en autant de tranches que de processeurs disponibles (`Runtime.getRuntime().availableProcessors()`). Chaque thread lit sa tranche de manière indépendante et insère dans des `ConcurrentHashMap`, ce qui permet une indexation quasi-linéaire en nombre de cœurs. Les listes de positions utilisent `Collections.synchronizedList()` pour la sécurité concurrentielle.

### 3. Persistance des index (fichiers `.hashmap`)

`MapsObjet` implémente `Externalizable` (et non seulement `Serializable`) pour contrôler finement la sérialisation des cinq hashmaps. Le fichier `.hashmap` est créé à côté du fichier PGN d'origine. Au redémarrage, si l'index existe, il est chargé directement — ce qui transforme un temps d'indexation de plusieurs minutes en un chargement de quelques secondes.

### 4. Communication par sockets et sérialisation Java brute

Le protocole client-serveur repose sur des `ObjectOutputStream`/`ObjectInputStream` pour les objets (`ClientInfo`) et des `BufferedWriter`/`BufferedReader` pour les messages textuels. Ce choix est simple et direct, adapté à un projet académique sans exigence d'interopérabilité.

### 5. Sémaphore personnalisé

Le module `Dependance` contient une classe `Semaphore` maison qui implémente les opérations `acquire()`, `release()` et `finished()` via `wait()`/`notifyAll()`. Elle sert à limiter le nombre de threads simultanés dans les calculs coûteux (PageRank, coups consécutifs).

### 6. Mode itératif avec index secondaires persistés

Quand un client choisit de « réitérer » sur un sous-ensemble de parties, `CreeMapIteration` construit un nouvel index restreint aux positions trouvées, et le persiste dans un fichier `.hashmap` nommé d'après la description de la recherche. Cela permet des recherches en cascade sans re-parcourir le fichier original.

### 7. Calcul de PageRank adapté aux échecs

Le graphe est construit ainsi : chaque joueur est un nœud, un lien sortant relie le perdant vers le gagnant de chaque partie. Le score PageRank est calculé sur 10 itérations avec un facteur d'amortissement de 0.85. Les résultats sont persistés dans un fichier `.pageRankMap`.

### 8. Gestion de la concurrence côté serveur

Le serveur limite le nombre de clients simultanés à `availableProcessors() / 4`. Chaque client reçoit un « budget de demandes » (`nbDemande`) calculé comme `availableProcessors() / maxClients`. Ce mécanisme empêche un client de saturer les ressources serveur.

---

## Extraits de code remarquables

### Extrait 1 — Indexation parallèle multi-thread (`CreeMap.java`)

**Fichier** : `Serveur/src/maps/CreeMap.java`

```java
public void createMaps()
{
    long tempsRecherche = System.currentTimeMillis();

    List<Thread> lstThreads = new ArrayList<>();
    for (int i = 0; i < this.nbThreads; i++)
    {
        int I = i;
        Thread t = new Thread(() ->
        {
            try
            {
                calcule(this.posDeb + (nbOctetsParThread * I));
            } catch (IOException e) {e.printStackTrace();}
        });
        lstThreads.add(t);
        t.setPriority(Thread.MAX_PRIORITY);
        t.start();
    }
    Thread th = new Thread(this::afficheOctetLu);
    th.start();
    try
    {
        for (Thread t : lstThreads) t.join();
        this.creeMapOk = true;
        th.join();
    } catch (InterruptedException e) {e.printStackTrace();}
```

**Pourquoi c'est intéressant** : L'indexation du fichier PGN est découpée en autant de tranches que de cœurs disponibles. Chaque thread reçoit une position de départ (`posDeb + nbOctetsParThread * I`) et traite sa portion de manière autonome. Les `ConcurrentHashMap` permettent les écritures concurrentes sans verrou global. Un thread séparé affiche la progression en temps réel. C'est une approche efficace pour tirer parti du matériel sur des fichiers de dizaines de gigaoctets.

---

### Extrait 2 — Construction des maps par positionnement fichier (`CreeMap.calcule()`)

**Fichier** : `Serveur/src/maps/CreeMap.java`

```java
private void calcule(long deb) throws IOException
{
    FileInputStream in = new FileInputStream(file);
    BufferedReader reader = new BufferedReader(new InputStreamReader(in));
    in.getChannel().position(deb);

    Long octetDeb = in.getChannel().position();
    // ... parsing PGN ...
    while ((str = reader.readLine()) != null && octetDeb <= deb + nbOctetsParThread + 5000)
    {
        // ... extraction des métadonnées ...
        switch (buf[0])
        {
            case "White", "Black" ->
            {
                if (this.mapsObjet.getNameMap().containsKey(buf[1]))
                    this.mapsObjet.getNameMap().get(buf[1]).add(octetDeb);
                else
                    this.mapsObjet.getNameMap().putIfAbsent(buf[1],
                        Collections.synchronizedList(new ArrayList<>(Collections.singleton(octetDeb))));
            }
            case "UTCDate" ->
            {
                long utcDate = new SimpleDateFormat("yy.MM.dd").parse(buf[1]).getTime();
                // ... insertion dans utcDateMap ...
            }
            case "WhiteElo", "BlackElo" ->
            {
                int elo = Integer.parseInt(buf[1]);
                // ... insertion dans eloMap ...
            }
        }
```

**Pourquoi c'est intéressant** : Plutôt que de charger tout le fichier en mémoire, cette méthode utilise `FileInputStream.getChannel().position()` pour se positionner directement à l'octet voulu. Les métadonnées PGN (joueur, Elo, date, ouverture) sont extraites en une seule passe et stockées comme clés dans les hashmaps, avec pour valeur la position octet de début de partie. Ce design permet d'indexer des fichiers arbitrairement volumineux avec une empreinte mémoire contrôlée.

---

### Extrait 3 — Persistance et chargement des index (`CreeMapsOrRead.java` + `MapsObjet.java`)

**Fichier** : `Serveur/src/maps/CreeMapsOrRead.java`

```java
public void charge()
{
    try
    {
        if (Files.exists(Path.of(fileMaps.getAbsolutePath())))
        {
            ObjectInputStream ois = new ObjectInputStream(new FileInputStream(fileMaps));
            this.mapsObjet = (MapsObjet) ois.readObject();
            this.chargementMap = this.mapsObjet.isChargementMapOk();
        }
    } catch (...) { ... }

    if (!this.mapsObjet.isChargementMapOk())
    {
        CreeMap cr = new CreeMap(this.mapsObjet, file, 0L, file.length());
        cr.createMaps();
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(fileMaps));
        oos.writeObject(this.mapsObjet);
    }
}
```

**Fichier** : `Serveur/src/maps/MapsObjet.java` (méthode `writeExternal`)

```java
@Override
public void writeExternal(ObjectOutput out) throws IOException
{
    double p = (double) 100 / this.lstMaps.size();
    int i = 0;
    for (Map map : this.lstMaps)
    {
        this.ecriturePoucentage = (int) (p * i);
        log.info("Ecriture des Maps : " + this.ecriturePoucentage + "%");
        out.writeObject(map);
    }
    out.writeObject(this.nbParties);
    out.writeObject(this.file);
}
```

**Pourquoi c'est intéressant** : L'approche « créer une fois, charger ensuite » est essentielle pour la DX : le premier lancement indexe le fichier (long), mais les lancements suivants chargent l'index sérialisé (rapide). L'implémentation `Externalizable` offre un contrôle fin sur la sérialisation et un logging de progression — un choix plus maitrisé que la sérialisation par défaut.

---

### Extrait 4 — Algorithme de PageRank sur le graphe de victoires

**Fichier** : `Serveur/src/recherche/autres/pagerank/PageRank.java`

```java
private void calcule()
{
    // Création des nœuds — chaque joueur reçoit un score initial uniforme
    for (Object joueur : mapObjet.getNameMap().keySet())
    {
        mapNoeuds.put((String) joueur, new Noeud((String) joueur, 1.0 / mapObjet.getNameMap().size()));
    }

    // Recherche des liens entrants (victoires subies) et sortants (victoires obtenues)
    for (Map.Entry<Object, List<Long>> entry : mapObjet.getNameMap().entrySet())
    {
        new Thread(() -> calculeNoeuds(partiesFile.getAllParties(entry.getValue()))).start();
    }
    semaphore.finished();

    // Itérations de PageRank
    for (int i = 0; i < this.nbIterations; i++)
    {
        for (Map.Entry<String, Noeud> entry : mapNoeuds.entrySet())
        {
            new Thread(() -> calculePageRank(entry)).start();
        }
        semaphore.finished();
        for (Noeud noeud : mapNoeuds.values())
            noeud.setAncienScore(noeud.getScore());
    }
}

private void calculePageRank(Map.Entry<String, Noeud> entry)
{
    semaphore.acquire();
    double somme = 0.0;
    for (String joueur : entry.getValue().getLiensEtrants().keySet())
    {
        somme += (double) mapNoeuds.get(joueur).nbLiensSortants(entry.getKey())
               / mapNoeuds.get(joueur).nbLiensSortants()
               * mapNoeuds.get(joueur).getAncienScore();
    }
    entry.getValue().setScore(0.15 / mapObjet.getNameMap().size() + 0.85 * somme);
    semaphore.release();
}
```

**Pourquoi c'est intéressant** : L'adaptation de PageRank au domaine des échecs est une idée originale. Un lien sortant du nœud A vers le nœud B signifie que A a perdu contre B. Ainsi, un joueur qui bat de nombreux adversaires déjà bien classés voit son score augmenter. Le facteur d'amortissement 0.85 et le terme de teleporation (`0.15 / N`) suivent la formulation classique. Le sémaphore maison contrôle le parallélisme, et les résultats sont persistés pour éviter le recalcul.

---

### Extrait 5 — Architecture de recherche par héritage (`Recherche` → `RecherchePartieSpecifique`)

**Fichier** : `Serveur/src/recherche/Recherche.java`

```java
public abstract class Recherche
{
    protected final ObjectInputStream clientReader;
    protected final BufferedWriter clientWriter;
    protected MapsObjet mapObjet;
    protected PartiesFile partiesFile;

    public abstract void cherche();
    public void envoieMessage(String message) { ... }
    public String litMess() { ... }
    public int litInt() { ... }
}
```

**Fichier** : `Serveur/src/recherche/RecherchePartieSpecifique.java`

```java
public abstract class RecherchePartieSpecifique extends Recherche
{
    protected List<Partie> lstPartie;
    protected List<Long> lstPosParties;
    protected boolean iterative = false;
    protected String description;

    public abstract void calcule();
    public abstract void initDemande();

    public MapsObjet getMapsObjetReiteration()
    {
        MapsObjet mp = new MapsObjet(this.mapObjet.getFile());
        new CreeMapIteration(mp, this.mapObjet.getFile(), this.lstPosParties).cree();
        return mp;
    }
}
```

**Pourquoi c'est intéressant** : Cette hiérarchie en deux niveaux (`Recherche` → `RecherchePartieSpecifique` → implémentations concrètes) sépare clairement les responsabilités. `Recherche` gère les I/O client. `RecherchePartieSpecifique` ajoute la logique de liste de positions, de mode itératif et de construction d'index secondaire. Chaque recherche concrète (`RecherchePartieJoueur`, `RechercheEnFonctionDate`, etc.) n'implémente que `cherche()`, `calcule()` et `initDemande()`. C'est un pattern Template Method bien appliqué.

---

### Extrait 6 — Sémaphore maison pour la concurrence

**Fichier** : `Dependance/src/semaphore/Semaphore.java`

```java
public class Semaphore
{
    private final int nbThreads;
    private int count;

    public Semaphore(int count)
    {
        this.count = count;
        this.nbThreads = count;
    }

    public synchronized void finished()
    {
        while (count != nbThreads)
        {
            try {wait();} catch (InterruptedException e) {e.printStackTrace();}
        }
    }

    public synchronized void acquire()
    {
        while (count == 0)
        {
            try {wait();} catch (InterruptedException e) {e.printStackTrace();}
        }
        count--;
    }

    public synchronized void release()
    {
        count++;
        notifyAll();
    }
}
```

**Pourquoi c'est intéressant** : Ce sémaphore de comptage est utilisé à travers tout le projet pour synchroniser les phases de calcul parallèle. La méthode `finished()` agit comme une barrière (elle attend que tous les `release()` soient appelés, i.e. `count == nbThreads`). C'est un mécanisme simple mais efficace pour coordonner les vagues de threads dans `PageRank`, `NbCoupsConsecutifsParties` et `JoueursLesplusActifs`.

---

### Extrait 7 — Chargement paresseux des parties via positionnement fichier

**Fichier** : `Serveur/src/partie/PartiesFile.java`

```java
private Partie getPartie(Long pos) throws IOException
{
    FileInputStream fileInputStream = new FileInputStream(file);
    BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream));
    fileInputStream.getChannel().position(pos);

    int comptLigneVide = 0;
    String str;
    List<String> lstStr = new ArrayList<>();
    while (comptLigneVide < 2)
    {
        str = reader.readLine();
        if (str.equals("")) comptLigneVide++;
        else lstStr.add(str);
    }
    fileInputStream.close();
    reader.close();
    return new Partie(lstStr);
}
```

**Pourquoi c'est intéressant** : Cette méthode illustre la stratégie d'accès paresseux du projet. Plutôt que d'avoir des millions d'objets `Partie` en mémoire, on ne matérialise une partie qu'à partir de sa position octet dans le fichier. Le format PGN est délimité par deux lignes vides consécutives — la boucle `comptLigneVide < 2` exploite cette propriété pour lire exactement une partie depuis n'importe quelle position.

---

## Qualité, sécurité, maintenance

### Tests
Le module IntelliJ référence un dossier `src/test/java` dans la configuration Maven initiale, mais **aucun test n'est présent** dans le dépôt. C'est une lacune notable pour un projet de cette envergure.

### Logging
Un système de logging maison (`utils.Log`) avec niveaux DEBUG, INFO, WARNING, ERROR, FATAL et coloration ANSI. Simple et suffisant pour le débogage en phase de développement, mais moins robuste qu'une solution comme SLF4J/Logback (pas de rotation, pas de filtrage dynamique).

### Gestion d'erreurs
Les exceptions sont globalement interceptées et loguées, mais parfois avalées silencieusement (`e.printStackTrace()` sans re-raise). La méthode `ConnexionClient.litMess()` gère correctement la déconnexion brutale d'un client via `EOFException`.

### Format de code
Le code est lisible mais montre des incohérences mineures (typo dans un nom de classe : `RechereEnFonctionDuPremierCoup` au lieu de `RechercheEnFonctionDuPremierCoup`). Pas de configuration de linter ou de formatter détectée.

### CI/CD
Aucun pipeline CI/CD, pas de configuration Maven/Gradle opérationnelle (Maven a été retiré, le projet utilise les modules IntelliJ natifs).

---

## Installation et execution (local)

### Prérequis
- **JDK 17+**
- **RAM** : 16 Go pour < 10 Go de données, 32 Go pour 10-100 Go, 64 Go au-delà
- **CPU** : minimum 4 cœurs / 8 threads recommandé
- Un dossier `data/` contenant un ou plusieurs fichiers `.pgn` (disponibles sur [database.lichess.org](https://database.lichess.org/))

### Lancement du serveur

```bash
java -Xmx32g -jar Serveur.jar
```

Remplacer `32g` par la quantité de RAM disponible. Le serveur demande interactivement :
1. Le nombre maximum de clients simultanés
2. Le fichier PGN à charger
3. Le port d'écoute (1025-65535)

### Lancement du client

```bash
java -jar Client.jar
```

Le client demande un nom d'utilisateur, le port et l'adresse IP du serveur.

### Compilation depuis les sources (IntelliJ)

1. Ouvrir le projet `Projet-INFO-4B` dans IntelliJ IDEA
2. Vérifier que le module `Dependance` est bien en dépendance de `Client` et `Serveur`
3. Compiler les artifacts `Client.jar` et `Serveur.jar` via *Build Artifacts*

---

## Liens

- **Source des données** : [https://database.lichess.org/](https://database.lichess.org/)
- **Auteurs** : Yilmaz Rahman (développement principal), Colliat Maxime (contribution sur `PartiesFile`)
