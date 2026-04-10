# 6-qui-prend | Rapport technique

## En bref

- Jeu de cartes multijoueur en réseau (« 6 qui prend ! » / *6 Nimmt!*), implémenté en C natif avec communication par sockets TCP.
- Architecture client-serveur : un serveur central gère la logique de jeu et diffuse l'état du plateau à tous les participants connectés.
- Concurrence via **POSIX Threads** (un thread par joueur), gestion des signaux UNIX (SIGINT/SIGTERM) et création de bots par `fork`/`execv`.
- Interface terminale colorisée grâce à des codes d'échappement ANSI, avec logging horodaté dans des fichiers dédiés.
- Projet académique de Systems et Réseaux (L3 Informatique, semestre 1), conçu pour mettre en pratique la programmation système bas niveau.

## Contexte et objectif

Ce projet a été réalisé dans le cadre du module « Systèmes et Réseaux » d'un cursus de Licence 3 Informatique. L'objectif pédagogique était double :

1. **Programmation réseau** : implémenter une communication fiable entre plusieurs processus distants via l'API sockets TCP/IP.
2. **Programmation système** : manipuler les threads POSIX, les signaux, les processus (fork/exec), la gestion mémoire manuelle et les entrées/sorties fichier.

Le jeu choisi comme support est le *6 qui prend !* (Wolfgang Kramer, 1994), un jeu de cartes à prise de risque où chaque joueur cherche à éviter de ramasser des têtes de bœuf. Le jeu se prête bien à un modèle client-serveur car il nécessite un état centralisé (le plateau) et des prises de décision distribuées (choix des cartes par chaque joueur).

## Fonctionnalités

- **Partie multijoueur en réseau** (2 à 10 joueurs) via TCP.
- **Lobby de connexion** : les joueurs se connectent au serveur, choisissent un pseudo, et signalent qu'ils sont prêts.
- **Bots autonomes** : ajout dynamique de joueurs IA via la commande `[b]` ; les bots sont des processus fils lancés par `fork`/`execv`.
- **Parties enchaînées** : à la fin d'une partie, le serveur peut relancer avec les mêmes joueurs.
- **Paramétrage des règles** : nombre de têtes maximal et nombre de manches configurable avant chaque partie.
- **Statistiques de fin de partie** : moyenne des têtes, joueur avec le plus/moins de défaites, durée de la partie.
- **Journalisation** : chaque partie est enregistrée dans un fichier log horodaté dans le répertoire `LOG/`.
- **Documentation Doxygen** : configuration Doxygen incluse pour générer la documentation technique.

## Architecture (vue d'ensemble)

### Structure des répertoires

```
6-qui-prend/
├── README.md
├── Projet_S&R_Doxygen        # Configuration Doxygen (Doxyfile)
└── src/
    ├── Serveur.c / Serveur.h  # Point d'entrée serveur, gestion réseau, boucle de jeu
    ├── Client.c / Client.h    # Point d'entrée client, interface terminale
    ├── Bot.c / Bot.h          # Client automatisé (IA aléatoire)
    ├── Jeu.h                  # Logique métier : cartes, plateau, distribution, règles
    └── Color.h                # Macros ANSI pour la coloration du terminal
```

### Modèle client-serveur

Le projet adopte une architecture **client-serveur centralisée** classique :

- **Serveur** (`Serveur.c`) : processus unique qui écoute sur un port TCP (65534 par défaut). Il accepte les connexions entrantes, maintient l'état global du jeu (plateau, cartes, scores) et orchestre les tours. Chaque joueur connecté est géré dans un thread dédié.
- **Client** (`Client.c`) : processus terminal qui se connecte au serveur, envoie les actions du joueur (pseudo, prêt, choix de carte) et affiche en continu les messages reçus via un thread d'écoute permanent.
- **Bot** (`Bot.c`) : variante du client qui se connecte automatiquement et joue de manière aléatoire en sélectionnant un chiffre parmi les options valides envoyées par le serveur.

### Flux de données d'un tour de jeu

```
1. Serveur → Tous les joueurs  :  Affichage du round, des cartes du joueur
2. Serveur (thread par joueur) :  Attente du choix de carte (recv)
3. Tous les choix collectés    :  Tri par numéro de carte croissant
4. Serveur (logique plateau)   :  Placement des cartes, gestion des pénalités
5. Serveur → Tous les joueurs  :  Affichage du plateau mis à jour
6. Vérification des conditions de fin (têtes max / tours max)
```

### Séparation des responsabilités

| Module | Responsabilité |
|--------|---------------|
| `Serveur.c/h` | Réseau (bind, listen, accept, send/recv), gestion des clients, boucle principale, signaux |
| `Client.c/h` | Connexion au serveur, saisie utilisateur, affichage des messages |
| `Bot.c/h` | Connexion automatique, sélection aléatoire de cartes |
| `Jeu.h` | Logique pure du jeu : création de cartes, plateau, distribution, placement, pénalités, statistiques |
| `Color.h` | Constantes ANSI pour l'affichage coloré |

## Choix techniques et raisons

### 1. Sockets TCP plutôt qu'UDP

Le protocole TCP (SOCK_STREAM) garantit la livraison ordonnée et fiable des messages. C'est un choix adapté à un jeu de cartes au tour par tour où la perte d'un message (choix de carte) corromprait l'état du jeu. L'overhead de TCP est négligeable pour ce type d'application.

### 2. Un thread par joueur (POSIX Threads)

Chaque joueur connecté est géré dans un thread dédié (`pthread_create` dans `listen_choix_carte_joueur`). Ce modèle permet au serveur de collecter simultanément les choix de tous les joueurs, puis de synchroniser via `pthread_join` avant de résoudre le tour. C'est un pattern producteur-consommateur simplifié.

### 3. Fork/Exec pour les bots

Les bots ne sont pas gérés en mémoire dans le serveur mais lancés comme des processus séparés via `fork()` + `execv()` (cf. `ajout_bot()` dans `Serveur.c`). Cela signifie qu'un bot se connecte exactement comme un client humain, via le même protocole réseau. Ce choix isole le code du bot du serveur et facilite le débogage.

### 4. Identification des bots par un nombre magique

Les bots s'identifient en envoyant un nombre spécial (`0xFFFFF`, soit 1048575) comme pseudo. Le serveur détecte cette valeur dans `is_bot()` et marque le client comme bot. C'est un mécanisme simple (bien que rudimentaire) pour différencier les connexions humaines des connexions automatisées.

### 5. Header-only pour la logique de jeu (`Jeu.h`)

Toute la logique du jeu (structures de données, fonctions de plateau, distribution) est implémentée dans un fichier header (`Jeu.h`) avec des fonctions `inline`. Ce choix réduit la complexité de compilation (pas de fichier `.c` séparé) au prix d'une compilation plus longue et d'un couplage fort. C'est un compromis acceptable pour un projet de cette taille (~580 lignes).

### 6. Journalisation horodatée

Chaque partie génère un fichier dans le répertoire `LOG/` nommé avec la date et l'heure (`YYYY-MM-DD_HH:MM:SS_FICHIER_LOG.txt`). Les actions principales y sont consignées : connexions, choix de cartes, pénalités, statistiques finales. Cela permet un diagnostic post-mortem des parties.

### 7. Gestion des signaux pour l'arrêt propre

Les signaux SIGINT (Ctrl+C) et SIGTERM sont interceptés (`signal()`) pour garantir un arrêt propre : fermeture des sockets clients, écriture du fichier log, libération de la mémoire. Cela évite de laisser des sockets orphelins ou des fichiers log incomplets.

### 8. Affichage ANSI coloré

Un header dédié (`Color.h`) définit des macros pour 8 couleurs × 4 variantes (normal, gras, souligné, fond) + haute intensité. Ce choix améliore la lisibilité du terminal sans bibliothèque externe, ce qui est cohérent avec l'approche bas niveau du projet.

## Extraits de code remarquables

### Extrait 1 — Boucle principale du serveur et initialisation réseau

**Fichier** : `src/Serveur.c` (lignes 36–141)

```c
int main(int argc, char **argv) {
    srand(time(NULL));

    // Création du répertoire de logs si nécessaire
    if (access(strcat(pwd, "/LOG"), F_OK) != 0) {
        unsigned short check = mkdir("LOG", 0771);
        if (!check) printf("SUCCÈS CREATION DU DOSSIER LOG\n");
    }

    // Génération du nom de fichier log avec horodatage
    time_t heure_local = time(NULL);
    struct tm *tm = localtime(&heure_local);
    strftime(date, 128, "%Y-%m-%d_%H:%M:%S_FICHIER_LOG.txt", tm);

    // Gestion propre des signaux
    signal(SIGINT, gestion_signaux_serveur);
    signal(SIGTERM, gestion_signaux_serveur);

    if (argc == 2) PORT = atoi(argv[1]);

    serveur_socket = socket(AF_INET, SOCK_STREAM, 0);
    // ... bind, listen ...

    // Thread dédié à l'acceptation des connexions
    pthread_t thread;
    pthread_create(&thread, NULL, &listen_joueurs, NULL);

    // Attente que tous les joueurs soient prêts
    while (all_joueur_pret() != 1) { usleep((useconds_t) .1); }

    init_jeu(&jeu);
    gettimeofday(&begin, 0);
    jeu_play(&jeu);
    end_serveur();
}
```

**Pourquoi c'est intéressant** : Cette fonction `main` condense en ~100 lignes l'ensemble du cycle de vie d'un serveur réseau — création de socket, bind, listen, gestion de la concurrence, initialisation du jeu, boucle principale, puis arrêt propre. L'utilisation d'un thread séparé pour `listen_joueurs` permet au serveur d'accepter de nouvelles connexions pendant que le thread principal attend que les joueurs soient prêts.

---

### Extrait 2 — Résolution d'un tour de jeu avec concurrence

**Fichier** : `src/Serveur.c` (lignes 204–308)

```c
void jeu_play(Jeu *jeu) {
    while (1) {
        pthread_t threads[nb_client];

        // Lancement d'un thread par joueur pour collecter le choix de carte
        for (int i = 0; i < nb_client; ++i) {
            if (clients[i]->bot_or_not == 0)
                pthread_create(&threads[i], NULL, listen_choix_carte_joueur, (void *) clients[i]);
            else
                pthread_create(&threads[i], NULL, listen_choix_carte_bot, (void *) clients[i]);
        }

        // Attente de tous les choix (barrière implicite)
        for (int i = 0; i < nb_client; i++)
            pthread_join(threads[i], NULL);

        // Tri des joueurs par numéro de carte croissant
        Joueur **joueurs = get_ordre_joueur_tour(jeu);

        // Placement des cartes sur le plateau et gestion des pénalités
        for (int i = 0; i < nb_client; ++i) {
            int retour = ajoute_carte_au_plateau(jeu, joueurs[i]->carte_choisie);
            if (retour == 0 || retour == -1) {
                // Le joueur doit ramasser une ligne complète
                int ligne = get_pos_carte_mini(jeu, joueurs[i]->carte_choisie->numero) / 6;
                if (retour == -1)
                    ligne = carte_trop_petite(c);
                place_carte_si_trop_petite_ou_derniere_ligne(jeu, ligne, c->joueur);
            }
            // Vérification condition de victoire
            if (jeu->joueur[i]->nb_penalite >= nb_tete_max && !isOver) {
                isOver = 1;
                // ... statistiques, affichage, durée ...
                break;
            }
        }
        // ... renouvellement de manche si toutes les cartes sont jouées ...
    }
}
```

**Pourquoi c'est intéressant** : Ce pattern de « scatter-gather » avec `pthread_create` / `pthread_join` est une approche naturelle pour un jeu au tour par tour. Chaque thread collecte indépendamment le choix d'un joueur, puis le thread principal synchronise et résout le tour. La résolution suit les règles du *6 qui prend* : les cartes sont placées dans l'ordre croissant, la carte trop petite oblige le joueur à ramasser une ligne, et la 6e carte d'une ligne déclenche également une pénalité.

---

### Extrait 3 — Algorithme de placement d'une carte sur le plateau

**Fichier** : `src/Jeu.h` (lignes 327–370)

```c
char ajoute_carte_au_plateau(Jeu *jeu, Carte *carte) {
    char pos = get_pos_carte_mini(jeu, carte->numero);
    if (pos == -1) return -1;         // Carte trop petite pour toute ligne
    if (pos % 6 == 4) return 0;       // Dernière colonne (6e carte) → ramasser
    jeu->plateau[pos / 6][(pos % 6) + 1] = *carte;
    return 1;
}

char get_pos_carte_mini(Jeu *jeu, int numero) {
    short diff = numero - get_dernier_carte_ligne(jeu, 0);
    char pos = -1;
    if (diff > 0)
        pos = get_pos_carte_derniere_ligne(jeu, 0);
    for (int i = 1; i < 4; ++i) {
        if ((numero - get_dernier_carte_ligne(jeu, i)) >= 0) {
            if ((numero - get_dernier_carte_ligne(jeu, i)) < diff) {
                diff = numero - get_dernier_carte_ligne(jeu, i);
                pos = (i * 6) + get_pos_carte_derniere_ligne(jeu, i);
            }
        }
    }
    return pos;
}
```

**Pourquoi c'est intéressant** : Cet algorithme encode la règle centrale du *6 qui prend* : une carte doit être placée sur la ligne dont la dernière carte est la plus proche (en valeur) mais strictement inférieure. L'encodage compact (un index plat dans un plateau logique 4×6) montre une approche économe en mémoire, typique de la programmation C. Les codes de retour (`-1`, `0`, `1`) distinguent les trois cas de figure du jeu.

---

### Extrait 4 — Client avec thread d'écoute permanent

**Fichier** : `src/Client.c` (lignes 17–107)

```c
int main(int argc, char **argv) {
    // ... création socket, connexion au serveur ...

    signal(SIGINT, gestion_signaux_client);
    signal(SIGTERM, gestion_signaux_client);

    printf("Choisissez votre pseudo : ");
    scanf("%s", pseudo);
    send(sock, pseudo, strlen(pseudo), 0);

    // Thread dédié à la réception continue des messages du serveur
    pthread_t pthread;
    pthread_create(&pthread, NULL, &listen_all_time, NULL);

    // Boucle principale : envoi des actions du joueur
    while (1) {
        char *message = (char *) malloc(512);
        scanf("%s", message);
        send(sock, message, strlen(message), 0);
        free(message);
    }
}

void *listen_all_time(void *argv) {
    while (1) {
        char buffer[2048];
        int n = 0;
        if ((n = recv(sock, buffer, sizeof buffer - 1, 0)) == 0) {
            perror("Erreur dans fonction listen_all_time()");
            exit(errno);
        }
        buffer[n] = '\0';
        printf("%s\n", buffer);
    }
}
```

**Pourquoi c'est intéressant** : Le client sépare proprement l'envoi et la réception en deux flux parallèles. Le thread `listen_all_time` bloque sur `recv` et affiche chaque message dès qu'il arrive, tandis que le thread principal bloque sur `scanf` pour capturer la saisie utilisateur. C'est un modèle simple mais efficace pour un client terminal en C.

---

### Extrait 5 — Bot autonome avec sélection aléatoire

**Fichier** : `src/Bot.c` (lignes 13–83)

```c
int main(int argc, char *argv[]) {
    srand(time(NULL));
    // ... connexion socket ...

    // Identification comme bot via un nombre magique
    char nom[1024];
    snprintf(nom, 1024, "%llu", bot_type);  // bot_type = 0xFFFFF
    send(sock, nom, strlen(nom), 0);

    while (1) {
        char buffer[2048];
        int n = recv(sock, buffer, sizeof buffer - 1, 0);
        buffer[n] = '\0';

        // Sélection aléatoire parmi les options valides envoyées par le serveur
        char chiffre;
        do {
            chiffre = buffer[rand() % n];
        } while (strcmp(&chiffre, "") == 0);

        send(sock, &chiffre, 1, 0);
    }
}
```

**Pourquoi c'est intéressant** : Le bot est remarquablement simple — moins de 50 lignes effectives. Il se connecte comme un client standard, mais au lieu de lire l'entrée utilisateur, il sélectionne aléatoirement un caractère parmi les options valides envoyées par le serveur (les indices des cartes disponibles). Le serveur, de son côté, envoie uniquement les indices valides (par exemple `"1357"` pour les cartes 1, 3, 5, 7 non encore jouées), ce qui garantit que le bot ne peut pas tricher.

---

### Extrait 6 — Structures de données du jeu

**Fichier** : `src/Jeu.h` (lignes 22–38)

```c
typedef struct Carte {
    unsigned char numero, Tete, is_picked, is_used;
} Carte;

typedef struct Joueur {
    char pseudo[64];
    unsigned short nb_penalite, nb_defaite;
    Carte *carte[10];
    Carte *carte_choisie;
} Joueur;

typedef struct Jeu {
    Carte **plateau;
    Joueur *joueur[MAX_JOUEURS];
    Carte *liste_carte[104];
} Jeu;
```

**Pourquoi c'est intéressant** : Les structures utilisent des types compacts (`unsigned char` pour les cartes) et un mélange d'allocation statique (tableaux de pointeurs de taille fixe) et dynamique (`malloc` pour chaque carte et chaque joueur). Le plateau est une matrice 4 lignes × 6 colonnes, correspondant aux 4 rangées du jeu de société. Le champ `Tete` stocke la pénalité associée à chaque carte (têtes de bœuf), et les flags `is_picked`/`is_used` gèrent l'état de distribution et d'utilisation.

---

### Extrait 7 — Spawn d'un bot par fork/exec

**Fichier** : `src/Serveur.c` (lignes 706–714)

```c
void ajout_bot() {
    int x = fork();
    char *nom_programme = "bot";
    char port[1024];
    snprintf(port, 1024, "%d", PORT);
    char *args[] = {nom_programme, port, "127.0.0.1", NULL};

    if (x == 0) execv(nom_programme, args);
}
```

**Pourquoi c'est intéressant** : Cette fonction illustre le pattern classique `fork` + `execv` sous UNIX. Le serveur crée un processus fils qui se remplace immédiatement par l'exécutable `bot`. Le bot hérite implicitement de rien d'autre que ses arguments (port et adresse), et communique ensuite exclusivement via le réseau. Cela isole complètement l'exécution du bot du processus serveur : si le bot crash, le serveur continue.

## Qualité, sécurité, maintenance

### Tests

Le dépôt ne contient pas de suite de tests automatisés. La validation a été réalisée par tests manuels (jeux d'essai multi-clients), ce qui est cohérent avec la nature pédagogique du projet.

### Gestion mémoire

Le projet fait un usage intensif de `malloc` (cartes, joueurs, buffers de messages). La fonction `free_serveur()` et `free_jeu()` assurent la libération en fin de partie. Quelques fuites potentielles subsistent — par exemple, les `malloc(512)` dans la boucle `while(1)` du client sont libérés itérativement, mais un arrêt brutal (signal) peut contourner cette libération.

### Gestion d'erreurs

Les appels système critiques (`socket`, `bind`, `connect`, `recv`) sont systématiquement vérifiés avec `perror` en cas d'échec. Le serveur se termine proprement via `end_serveur()` qui ferme les fichiers, sockets et libère la mémoire.

### Documentation

Un fichier Doxyfile est inclus, configuré pour le langage C (`OPTIMIZE_OUTPUT_FOR_C = YES`) avec sortie en français (`OUTPUT_LANGUAGE = French`). Les fonctions principales sont annotées avec des commentaires Doxygen (`@brief`, `@details`, `@param`, `@return`).

### Git

Le dépôt compte plus de 25 commits sur la branche principale, avec des messages descriptifs en français. L'historique montre un développement itératif : mise en place du réseau → logique de jeu → ajout des bots → correction de bugs → optimisation.

## Installation et exécution (local)

### Prérequis

- Compilateur C (GCC ou Clang)
- Système d'exploitation UNIX (Linux, macOS)
- Bibliothèque POSIX (`pthread`, sockets)

### Compilation et lancement

Depuis le répertoire `src/` :

```bash
# Compiler le serveur
gcc Serveur.c -lpthread -o Serveur

# Compiler le client
gcc Bot.c -o bot && gcc Client.c -lpthread -o Client

# Lancer le serveur (port optionnel, 65534 par défaut)
./Serveur [port]

# Lancer un client (IP et port optionnels)
./Client [adresse IP] [port]

# Lancer un bot manuellement
./bot 65534 127.0.0.1
```

Des scripts shell (`Serveur.sh`, `Client.sh`, `Bot.sh`) sont fournis pour compiler et exécuter en une commande.

### Déroulement typique

1. Lancer `./Serveur` dans un terminal.
2. Lancer `./Client` dans un ou plusieurs autres terminaux.
3. Chaque joueur entre son pseudo, puis tape `y` ou `pret` pour se mettre prêt.
4. Optionnellement, un joueur peut taper `b` pour ajouter un bot.
5. La partie démarre automatiquement quand le minimum de joueurs est atteint.

## Liens

- **Dépôt GitHub** : [https://github.com/Sudo-Rahman/6-qui-prend](https://github.com/Sudo-Rahman/6-qui-prend)
