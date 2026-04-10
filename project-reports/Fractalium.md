# Fractalium | Rapport technique

## En bref

- **Calcul distribué de fractales** (Mandelbrot, Julia, Burning Ship, Newton, Koch) via C++ MPI avec architecture maître/esclave.
- Interface graphique temps réel en Qt (sélection de zone, zoom, historique, export).
- Précision arbitraire à 100 décimales via `boost::multiprecision::cpp_dec_float_100` pour des zooms profonds sans perte.
- Script Python de découverte automatique de nœuds de cluster par SSH concurrent.
- Système de snapshots sérialisés (`.fractalium`) avec récupération après crash (capture de `SIGSEGV`, `SIGABRT`, etc.).
- CI/CD GitHub Actions : build Release sur Ubuntu, packaging et release automatique.

---

## Contexte et objectif

Fractalium est un projet académique de calcul distribué visant à générer et explorer interactivement des ensembles fractals classiques. Le besoin fondamental est simple : le calcul pixel par pixel d'une image fractale est un problème *embarrassingly parallel*, idéalement adapté à une architecture MPI. Le projet combine ce calcul haute performance avec une interface utilisateur interactive permettant de zoomer dans les fractales, de naviguer dans l'historique, et de sauvegarder/restaurer des sessions complètes.

Les auteurs sont [Sudo-Rahman](https://github.com/Sudo-Rahman) et [Maxime-Cllt](https://github.com/Maxime-Cllt). Le projet a été conçu pour tourner sur les clusters de machines des salles de TP universitaires (MI103, MI104, MI105, MI121).

---

## Fonctionnalités

| Catégorie | Détail |
|-----------|--------|
| **Fractales supportées** | Mandelbrot, Julia, Burning Ship, Newton (z³−1), Koch (z⁴−1) |
| **Calcul distribué** | Répartition du calcul sur N nœuds MPI (colonnes ou carrés) |
| **Zoom interactif** | Sélection rectangulaire à la souris (QRubberBand) avec recalcul distribué |
| **Précision** | Arithmétique 100 décimales via Boost.Multiprecision |
| **Historique** | Navigation avant/arrière dans l'historique des zooms |
| **Palettes de couleurs** | 7 modes : dynamique, feu, vert, vert clair, bleu, violet, rose |
| **Snapshots** | Export/import de sessions complètes au format `.fractalium` (sérialisation Boost) |
| **Récupération de crash** | Détection de crash au redémarrage, proposition de chargement du snapshot de secours |
| **Paramètres configurables** | Résolution (400–5120), itérations, algorithme de découpe, auto-snapshots |
| **Découverte de cluster** | Script Python parallélisé testant la connectivité SSH de ~60 machines |

---

## Architecture (vue d'ensemble)

```
Fractalium/
├── main.cpp                  # Point d'entrée : fork MPI maître/esclave
├── CMakeLists.txt            # Build system CMake (C++23, Qt, Boost.MPI)
├── script.py                 # Découverte de nœuds de cluster
├── .github/workflows/        # CI/CD (build + release Linux)
├── documentation/            # Doxyfile, PDF Doxygen, images
└── src/
    ├── MPI.hpp / MPI.cpp             # Cœur du calcul distribué (send/receive/calculate)
    ├── Fractal.hpp / Fractal.cpp     # Algorithmes fractals (pointCheck par type)
    ├── Complex.hpp / Complex.cpp     # Arithmétique complexe haute précision
    ├── Double.hpp                    # Alias boost::multiprecision::cpp_dec_float_100
    ├── Image.hpp / Image.cpp         # Image de divergence (setPixel, merge)
    ├── Color.hpp                     # Structure RGB sérialisable
    ├── History.hpp                   # Historique + sérialisation (makeSnapshot, importSnapshot)
    ├── FractalWidget.hpp/.cpp        # Widget Qt de rendu avec sélection souris
    ├── mainwindow.hpp/.cpp           # Fenêtre principale (UI, événements, signaux UNIX)
    ├── Settings.hpp/.cpp             # Configuration persistante via QSettings
    ├── SettingsDialog.hpp/.cpp       # Dialogue de paramètres
    └── SnapshotDialog.hpp/.cpp       # Dialogue d'import/export de snapshots
```

### Flux de données

1. **Initialisation** : `main.cpp` crée l'environnement MPI. Le processus de rang 0 lance la GUI Qt ; les autres entrent dans une boucle de réception infinie.
2. **Envoi (master)** : `MPICalculator::send()` découpe l'image en zones (colonnes ou carrés) et envoie un `MPIStruct` à chaque esclave via `world.send()`.
3. **Calcul (esclaves)** : Chaque esclave reçoit sa zone, itère `Fractal::pointCheck()` sur chaque pixel, remplit un objet `Image`, le renvoie au master.
4. **Réception (master)** : `MPICalculator::receive()` collecte les images partielles via `Image::merge()`, émet un signal `boost::signals2` quand toutes les zones sont reçues.
5. **Rendu** : Le signal déclenche un `PaintFractalEvent` (événement Qt custom) qui mappe la divergence en couleurs via la palette choisie et affiche le `QImage`.

### Patterns identifiés

- **Master/Worker** : architecture MPI classique avec un processus coordinateur et N travailleurs.
- **Signal/Slot** : Qt pour l'UI, `boost::signals2` pour la communication inter-couches MPI↔GUI.
- **Stratégie** : `Fractal::pointCheck()` délègue à la classe interne correspondante (Mandelbrot, Julia, etc.) via un switch sur `FractalType`.
- **Command/Event** : `PaintFractalEvent` est un événement Qt custom posté depuis le thread de réception MPI pour déclencher le rendu dans le thread UI.

---

## Choix techniques et raisons

### 1. C++23 avec optimisation agressive

`CMakeLists.txt` impose C++23, `-O3 -funroll-loops` et l'optimisation interprocédurale (`CMAKE_INTERPROCEDURAL_OPTIMIZATION_RELEASE`). Ces options maximisent les performances sur les boucles de calcul itératif qui constituent 99 % du temps d'exécution.

### 2. `boost::multiprecision::cpp_dec_float_100` pour la précision

Le type `Double` est un alias vers `cpp_dec_float_100`, offrant 100 décimales de précision. C'est essentiel pour les zooms profonds où un `double` standard (≈15 décimales) perd rapidement toute signification géométrique.

### 3. Boost.MPI + Boost.Serialization

Le choix de Boost.MPI (plutôt que l'API C MPI) permet la sérialisation automatique des structures `MPIStruct`, `Image`, `Fractal`, `SnapshotHistory` via `boost::serialization`. Cela évite d'écrire manuellement des MPI datatypes complexes.

### 4. Deux algorithmes de découpe : colonnes vs carrés

- **Colonnes** : chaque nœud reçoit une bande verticale. Simple, efficace quand le nombre de nœuds ≤ la largeur.
- **Carrés** : chaque nœud reçoit un bloc carré. Mieux adapté quand le nombre de nœuds dépasse la largeur de l'image.

Le choix est configurable et auto-sélectionné si `node_count > width`.

### 5. Qt pour l'interface graphique

Qt (5 ou 6) offre les widgets nécessaires (`QMainWindow`, `QRubberBand` pour la sélection, `QImage` pour le rendu, `QSettings` pour la persistance). Le MOC (`CMAKE_AUTOMOC ON`) automatise le système de signaux/slots.

### 6. Récupération après crash

La capture de `SIGSEGV`, `SIGABRT`, `SIGFPE`, `SIGILL`, `SIGINT`, `SIGTERM` permet de sérialiser l'état complet (historique, type de fractale, offsets) dans un fichier `snapshot_crash.fractalium` avant de quitter. Au redémarrage, `QSettings` indique si le programme a crashé, et une boîte de dialogue propose la restauration.

### 7. Script Python de découverte de cluster

`script.py` teste en parallèle (via `threading`) la connectivité SSH de ~60 machines de salles de TP, détermine le nombre de cœurs de chaque machine (`nproc --all`), et génère un fichier `hosts` compatible MPI.

### 8. CI/CD GitHub Actions

Le workflow `cmake-multi-platform.yml` compile en Release sur Ubuntu, installe Qt5/Qt6 et Boost, package le binaire en tarball, et crée une release GitHub automatique.

---

## Extraits de code remarquables

### Extrait 1 — Point d'entrée MPI : fork maître/esclave

**Fichier :** `main.cpp`

```cpp
int main(int argc, char *argv[]) {
    mpi::environment env(argc, argv); // MPI init
    mpi::communicator world;
    frac::MPICalculator mpiCalculator(world.rank());

    if (world.rank() == 0) {
        QApplication a(argc, argv); // Qt init — processus master
        MainWindow w;
        w.show();
        return QApplication::exec();
    } else { // processus esclave : boucle de réception
        while (true) {
            frac::MPIStruct mpiStruct;
            {
                world.recv(0, 0, mpiStruct);
            }
            Fractalium::MPICalculator::mpi_struct = mpiStruct;
            auto image = Fractalium::Image(mpiStruct.width, mpiStruct.height);
            frac::MPICalculator::calculate(mpiStruct, image);
            {
                world.send(0, 1, image);
            }
        }
    }
}
```

**Pourquoi c'est intéressant :** Ce pattern est caractéristique du modèle SPMD (Single Program, Multiple Data) de MPI. Le même binaire s'exécute sur tous les nœuds ; seul le rang détermine le comportement. Le rang 0 détient l'IHM, les autres restent en attente passive. La boucle infinie côté esclave est intentionnelle : les travailleurs doivent rester disponibles pour recevoir de nouvelles zones de calcul sans redémarrage.

---

### Extrait 2 — Répartition des zones de calcul

**Fichier :** `src/MPI.cpp` (méthode `MPICalculator::send`)

```cpp
void Fractalium::MPICalculator::send(const MPIStruct &data, Image &image) {
    mpi::communicator world;
    if (rank == 0) {
        auto node = world.size() - 1;
        MPIStruct mpi_tmp = data;

        // Algorithme de découpe par colonnes
        auto collumns = [&](int proc) {
            auto x_delta = data.end_x - data.start_x;
            mpi_tmp.start_x = x_delta / node * proc;
            mpi_tmp.end_x = x_delta / node * (proc + 1);
            world.send(proc + 1, 0, mpi_tmp);
            is_running = true;
        };

        // Algorithme de découpe par carrés
        auto squares = [&](int proc) {
            auto img_pixels = data.width * data.height;
            auto nb_pixel_per_node = img_pixels / (node - 1);
            auto sq = [&nb_pixel_per_node] { return sqrt(nb_pixel_per_node); };
            mpi_tmp.start_x = uint16_t(proc * sq()) % data.end_x;
            mpi_tmp.end_x = uint16_t((proc + 1) * sq()) % data.end_x;
            mpi_tmp.start_y = uint16_t((proc * sq()) / data.end_x) * sq();
            mpi_tmp.end_y = uint16_t(((proc * sq()) / data.end_x) + 1) * sq();
            if (mpi_tmp.end_y > data.height) mpi_tmp.end_y = data.height;
            world.send(proc + 1, 0, mpi_tmp);
            is_running = true;
        };

        node_working = node;
        switch (Settings::AREA_ALGORITHM_TYPE) {
            case Settings::COLLUMNS: {
                auto counter = node;
                while (counter > data.width) counter--;
                for (int proc = 0; proc < counter; ++proc) collumns(proc);
            } break;
            case Settings::SQUARES: {
                for (int proc = 0; proc < node; ++proc) squares(proc);
            } break;
        }

        future = std::async(std::launch::async, [&] {
            receive(image);
        });
    }
}
```

**Pourquoi c'est intéressant :** La répartition du travail est paramétrable. L'algorithme par colonnes est optimal quand le nombre de nœuds est inférieur à la largeur de l'image (chaque nœud prend une bande verticale complète). L'algorithme par carrés entre en jeu quand le cluster est large, en découpant l'image en tuiles. La réception est lancée asynchronement via `std::async` pour ne pas bloquer la boucle événementielle Qt.

---

### Extrait 3 — Algorithmes fractals (Strategy interne)

**Fichier :** `src/Fractal.cpp`

```cpp
int Fractal::Mandelbrot::pointCheck(const Complex &point, const int iterations) {
    int i;
    Complex z = Complex(0, 0);
    for (i = 0; i < iterations; ++i) {
        z = z * z + point;
        if (z.norm() > 2.0)
            break;
    }
    return i;
}

int Fractal::Julia::pointCheck(const Complex &point, const int iterations) {
    Complex z = point;
    int i;
    for (i = 0; i < iterations; ++i) {
        z = z * z + Fractal::Julia::juliaConstant; // c = 0.285 + 0.01i
        if (z.norm() > 2.0)
            break;
    }
    return i;
}

int Fractal::BurningShip::pointCheck(const Complex &point, const int iterations) {
    int i;
    Complex z = Complex(0, 0);
    for (i = 0; i < iterations; ++i) {
        z.real = abs(z.real);
        z.imag = abs(z.imag);
        z = z * z + point;
        if (z.norm() > 2.0)
            break;
    }
    return i;
}

int Fractal::Newton::pointCheck(const Complex &point, const int iterations) {
    Complex z = point;
    for (int i = 0; i < iterations; ++i) {
        Complex f_z = z * z * z - Complex(1.0, 0.0);
        Complex f_prime = Complex(3.0, 0.0) * z * z;
        z = z - f_z / f_prime;
        if (f_z.norm() < 1e-6) { return i; }
    }
    return iterations;
}
```

**Pourquoi c'est intéressant :** Chaque fractale implémente son algorithme d'itération comme une classe interne statique avec la même signature `pointCheck(Complex, int) -> int`. La classe `Fractal` agit comme un façade qui dispatche via un switch. L'ensemble de Newton utilise la méthode de Newton pour f(z) = z³−1 avec convergence sur `f(z) < 1e-6`. Le Burning Ship applique la valeur absolue aux composantes avant le carré — une variante qui produit une structure visuelle radicalement différente.

---

### Extrait 4 — Arithmétique complexe en précision arbitraire

**Fichier :** `src/Complex.cpp` + `src/Double.hpp`

```cpp
// Double.hpp
namespace Fractalium {
    typedef boost::multiprecision::cpp_dec_float_100 Double;
}

// Complex.cpp — multiplication complexe
Complex Complex::operator*(Complex const &obj) const {
    return {real * obj.real - imag * obj.imag,
            real * obj.imag + imag * obj.real};
}

// Division complexe
Complex Complex::operator/(Complex const &obj) const {
    return {(real * obj.real + imag * obj.imag) / (obj.real * obj.real + obj.imag * obj.imag),
            (imag * obj.real - real * obj.imag) / (obj.real * obj.real + obj.imag * obj.imag)};
}
```

**Pourquoi c'est intéressant :** Toute l'arithmétique (addition, soustraction, multiplication, division, norme) fonctionne en précision 100 décimales de manière transparente, car `real` et `imag` sont de type `Double` (alias `cpp_dec_float_100`). Cela signifie que les zooms très profonds dans les fractales ne souffrent pas de la perte de précision inhérente au `double` IEEE 754. Le coût en performance est significatif, mais le calcul distribué le compense.

---

### Extrait 5 — Fusion d'images partielles et récupération asynchrone

**Fichier :** `src/Image.cpp` + `src/MPI.cpp`

```cpp
// Image::merge — fusionne les résultats partiels des esclaves
void Fractalium::Image::merge(Fractalium::Image &image) {
    if (width() != image.width() || height() != image.height()) {
        throw std::invalid_argument("Images must have the same size");
    }
    for (int i = 0; i < width(); ++i) {
        for (int j = 0; j < height(); ++j) {
            if (image._image[i][j] != -1) // -1 = pixel non calculé
                _image[i][j] = image._image[i][j];
        }
    }
}

// MPICalculator::receive — collecte les résultats
void Fractalium::MPICalculator::receive(Image &image) {
    mpi::communicator world;
    if (rank == 0) {
        auto counter = new std::atomic<uint32_t>(0);
        for (int proc = 1; proc < node_count; ++proc) {
            auto image_tmp = Image();
            world.recv(proc, 1, image_tmp);
            image.merge(image_tmp);
            (*counter)++;
            node_recived(*counter);
            if (*counter == node_working) {
                is_running = false;
                finshed(); // signal boost::signals2
                counter->store(0);
            }
        }
        delete counter;
    }
}
```

**Pourquoi c'est intéressant :** La convention `-1` comme marqueur de « pixel non calculé » est simple et efficace : chaque esclave ne remplit que sa zone, le master assemble les résultats par écrasement conditionnel. Le signal `finshed` (sic) est émis via `boost::signals2` quand tous les nœuds ont répondu, ce qui déclenche le rendu Qt via un événement custom (`PaintFractalEvent`).

---

### Extrait 6 — Capture de signaux et sauvegarde de secours

**Fichier :** `src/mainwindow.cpp`

```cpp
void MainWindow::handleSignal() {
    if (instance == nullptr) return;

    std::signal(SIGSEGV, [](int signum) {
        MainWindow::signalSnapshot(signum, instance->_back_history,
                                   instance->_front_history, *instance->_fractal);
    });
    std::signal(SIGABRT, [](int signum) { /* même logique */ });
    std::signal(SIGFPE,  [](int signum) { /* même logique */ });
    std::signal(SIGILL,  [](int signum) { /* même logique */ });
    std::signal(SIGINT,  [](int signum) { /* même logique */ });
    std::signal(SIGTERM, [](int signum) { /* même logique */ });
}

void MainWindow::signalSnapshot(int signum,
                                const std::vector<Fractalium::History> &backHistory,
                                const std::vector<Fractalium::History> &frontHistory,
                                const Fractalium::Fractal &fractal) {
    Fractalium::SnapshotHistory snapshotHistory{backHistory, frontHistory, fractal};
    Fractalium::makeSnapshot(Settings::CRASH_SNAP_PATH, snapshotHistory);
    Settings::setCrash(); // persiste le flag crash via QSettings
    std::exit(signum);
}

// Au démarrage :
void MainWindow::lauchAfterCrash() {
    if (Settings::IS_CRASHED) {
        auto box = QMessageBox::critical(this, "Crash détecté",
            "Le programme a quitte de manière inattendue."
            " Voulez-vous charger la sauvegarde de l'image ?",
            QMessageBox::Yes | QMessageBox::No);
        if (box == QMessageBox::Yes) {
            auto snap = Fractalium::SnapshotHistory{};
            Fractalium::importSnapshot(Settings::CRASH_SNAP_PATH, snap);
            loadSnapshot(snap);
        }
        Settings::resetCrash();
    }
}
```

**Pourquoi c'est intéressant :** La persistance de l'état est gérée à deux niveaux. D'une part, les signaux UNIX fataux déclenchent une sérialisation d'urgence de l'état complet (historique des zooms, type de fractale, offsets) dans un fichier `.fractalium`. D'autre part, `QSettings` enregistre un flag `is_crashed` qui sera lu au prochain lancement pour proposer la restauration. C'est une approche robuste pour un programme de calcul qui peut être interrompu par Ctrl+C, un segfault ou un kill.

---

### Extrait 7 — Script de découverte de cluster

**Fichier :** `script.py`

```python
def handle_host(host):
    try:
        threads = subprocess.getoutput(
            f'ssh -o ConnectTimeout=2 -o BatchMode=yes {username}@{host} nproc --all')
        if threads.isdigit():
            with threading.Lock():
                with open('hosts', 'a') as file:
                    file.write(f"{host} slots={threads}\n")
                num_computers += 1
                total_processors += int(threads)
    except Exception as e:
        pass

# Création de threads pour chaque hôte
threads = [threading.Thread(target=handle_host, args=(host,)) for host in hosts]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()
```

**Pourquoi c'est intéressant :** Ce script résout un problème pratique : sur un cluster de salle de TP, les machines disponibles changent constamment. En testant ~60 machines en parallèle avec un timeout SSH de 2 secondes, le script génère en quelques secondes un fichier `hosts` directement exploitable par `mpirun -hostfile hosts`. La sortie inclut le nombre total de processeurs et la moyenne par machine.

---

## Qualité, sécurité, maintenance

### Tests

Aucun test automatisé (ni unitaire, ni d'intégration) n'est présent dans le dépôt. La validation repose sur l'exécution manuelle et la vérification visuelle des fractales produites.

### Lint / Format

Aucun outil de formatage automatique (clang-format, clang-tidy) n'est configuré.

### CI

Un workflow GitHub Actions compile le projet sur Ubuntu en mode Release, installe les dépendances (Qt5/Qt6, Boost, OpenMPI), package le binaire et crée une release GitHub. Le workflow est déclenché manuellement (`workflow_dispatch`) avec un paramètre de version.

### Gestion d'erreurs

- Vérification des bornes dans `Image::setPixel()` (lance `std::out_of_range`).
- Vérification de compatibilité de taille dans `Image::merge()`.
- Gestion des signaux UNIX fataux avec sauvegarde d'état.
- Protection contre l'exécution avec un seul nœud MPI (message d'avertissement dans la barre d'état).

### Documentation

Une documentation Doxygen complète est présente dans `documentation/Documentation.pdf`. Le `Doxyfile` est fourni à la racine de `documentation/`. Toutes les classes et méthodes publiques sont documentées.

### Logs

Pas de système de logging structuré. Les seules sorties sont des `std::cout` dans les handlers de signaux et des messages dans la barre d'état Qt.

---

## Installation et exécution (local)

### Prérequis

- Compilateur C++23 (GCC ≥ 12, Clang ≥ 16)
- CMake ≥ 3.26
- Qt 5 ou Qt 6 (modules Core, Gui, Widgets)
- Boost (notamment Boost.MPI et Boost.Serialization)
- OpenMPI (ou toute implémentation MPI compatible)
- Python 3 (pour le script de découverte de cluster, optionnel)

### Compilation

```bash
git clone https://github.com/Sudo-Rahman/Fractalium.git
cd Fractalium
mkdir build && cd build
cmake ..
make
```

### Exécution

**Local (multicœur) :**
```bash
mpirun -np <nombre_de_threads> ./Fractalium
```

**Cluster :**
```bash
# Générer le fichier hosts
python3 script.py <username>
# Lancer sur le cluster
mpirun -hostfile hosts ./Fractalium
```

**Note :** Un minimum de 2 nœuds MPI est requis (1 master + 1 esclave).

### Instantané de démonstration

Le dépôt inclut un fichier `sample.fractalium` importable via le menu *Historique > Instantané*, permettant de visualiser une séquence de 10+ zooms successifs sur l'ensemble de Mandelbrot.

---

## Liens

- **GitHub :** [https://github.com/Sudo-Rahman/Fractalium](https://github.com/Sudo-Rahman/Fractalium)
- **Documentation Doxygen :** `documentation/Documentation.pdf`
