# Projet-GL (Vanadium) | Rapport technique

## En bref

- Application Java Swing de gestion d'achat de fruits avec interface graphique desktop.
- Permet de parcourir, ajouter, modifier et supprimer des fruits dans trois types de contenants (Panier, Jus, Macédoine).
- Architecture MVC explicite avec pattern Observer pour la synchronisation vue-modèle, Factory pour la création d'objets et Composite pour les macédoines imbriquées.
- Build Maven (Java 20), tests JUnit 5 + Mockito, CI GitHub Actions avec exécution des tests via `xvfb-run` (GUI headless), releases automatiques.
- Projet universitaire de génie logiciel mené en équipe de 5, avec gestion Agile, pull-requests protégées et couverture de tests complète.

---

## Contexte et objectif

Ce projet s'inscrit dans un cours de Génie Logiciel. L'objectif pédagogique est de développer une application complète — depuis le cahier des charges jusqu'à la livraison — en appliquant des méthodes de travail collaboratif (AGILE, Git Flow, CI/CD, revues de code).

L'application finale, nommée **Vanadium**, offre une interface utilisateur graphique permettant à un utilisateur de :

- Choisir un type de contenant (Panier, Jus de fruit, Macédoine).
- Ajouter des fruits (Orange, Banane, Pomme) avec prix, origine et quantité.
- Modifier ou supprimer des fruits via un menu contextuel (clic droit).
- Boycotter une origine de pays pour retirer automatiquement tous les fruits de cette provenance.
- Visualiser en temps réel le prix total, le poids total et le nombre de fruits.
- Changer de contenant à tout moment via la barre de menus.

L'équipe est composée de Maxime Colliat, Yoan Dusoleil, Rahman Yilmaz, Rémy Barranco et Julie Prigent.

---

## Fonctionnalités

- **Sélection de contenant** : dialogue modal au lancement puis via le menu « Changer de Contenant ».
- **Catalogue de fruits** : Orange, Banane, Pomme (avec variantes `Inconnue` par défaut). Chaque fruit possède un prix, une origine (pays) et une image.
- **Ajout de fruit** : dialogue de création avec choix du type, du pays d'origine, du prix unitaire et de la quantité en kg. L'image s'actualise dynamiquement selon le type sélectionné.
- **Retrait de fruit** : via le bouton « − » (dernier fruit) ou via le menu contextuel « Supprimer » (fruit sélectionné).
- **Modification de fruit** : dialogue dédié accessible par clic droit. Pour une macédoine, le dialogue imbrique un sous-contrôleur MVC complet.
- **Boycott d'origine** : supprime tous les fruits d'un pays donné dans le contenant.
- **Calcul automatique** : prix total et poids total mis à jour en temps réel via le pattern Observer.
- **Vue console** : double affichage (IHM Swing + sortie console) pour le débogage.
- **Macédoine composite** : une macédoine peut contenir d'autres macédoines (pattern Composite).

---

## Architecture (vue d'ensemble)

Le code suit une architecture **MVC (Modèle–Vue–Contrôleur)** stricte avec séparation en packages :

```
org.vanadium/
├── App.java                        # Point d'entrée — assemblage MVC
├── interfaces/
│   ├── Fruit.java                  # Interface du domaine (fruit)
│   ├── ContenantFruit.java         # Interface des contenants
│   └── VueG.java                   # Interface des vues graphiques (Observer)
├── model/
│   ├── ContenantFruitAbstract.java  # Classe abstraite Observable
│   ├── Utils.java                  # Utilitaires (arrondi)
│   ├── panier/
│   │   ├── Panier.java             # Modèle Panier
│   │   ├── PanierPleinException.java
│   │   └── PanierVideException.java
│   ├── Jus/
│   │   ├── Jus.java                # Modèle Jus
│   │   └── JusVideException.java
│   ├── Macedoine/
│   │   ├── Macedoine.java          # Modèle Macédoine (Fruit + ContenantFruit)
│   │   └── MacedoineVideException.java
│   └── fruit/
│       ├── Orange.java / Banane.java / Pomme.java / Inconnue.java
│       └── FruitItem.java          # Wrapper (fruit, quantité) pour l'affichage
├── factories/
│   ├── FactoryFruit.java           # Création de fruits par type enum
│   └── FactoryContenant.java       # Création de contenants par type enum
├── controler/
│   ├── ControleurMainWindow.java   # Contrôleur principal (ajout/retrait)
│   └── ControllerPopMenuList.java  # Contrôleur du menu contextuel
└── view/
    ├── MainWindow.java             # Fenêtre principale Swing
    ├── VueConsole.java             # Vue console (Observer)
    ├── MenuBar.java                # Barre de menus
    ├── MenuFruitList.java          # Menu popup contextuel
    ├── CreateFruitDialog.java      # Dialogue de création de fruit
    ├── SelectContenantDialog.java  # Dialogue de choix du contenant
    └── modifyDialog/
        ├── AbstractModifyDialog.java      # Dialogue abstrait de modification
        ├── ModifyFruitDialog.java         # Modification d'un fruit simple
        └── ModifyMacedoineDialog.java     # Modification d'une macédoine
```

### Flux de données

1. **App** instancie le modèle (`ContenantFruitAbstract`), les vues (`MainWindow`, `VueConsole`) et le contrôleur (`ControleurMainWindow`).
2. Les vues s'enregistrent comme **observateurs** du modèle via `addObserver()`.
3. Les actions utilisateur (clic bouton, menu contextuel) sont interceptées par les contrôleurs (`ActionListener`).
4. Le contrôleur appelle les méthodes du modèle (`ajout()`, `retrait()`, `boycotteOrigine()`).
5. Le modèle appelle `setChanged()` + `notifyObservers()` → les vues se mettent à jour automatiquement.

---

## Choix techniques et raisons

1. **Pattern Observer (java.util.Observable/Observer)** : le modèle hérite de `Observable` via `ContenantFruitAbstract`. Chaque opération mutante appelle `notifyObservers()`, ce qui déclenche le rafraîchissement immédiat de `MainWindow` et de `VueConsole`. Ce choix garantit un couplage lâche entre modèle et vues et élimine toute logique de rafraîchissement manuel dans les contrôleurs.

2. **Pattern Factory** (`FactoryFruit`, `FactoryContenant`) : centralise la création d'objets métier à partir d'énumérations (`Fruit.Type`, `ContenantFruit.TypeContenant`). Simplifie l'ajout de nouveaux types de fruits ou de contenants sans modifier le code client.

3. **Pattern Composite** : la classe `Macedoine` implémente simultanément `ContenantFruit` (peut contenir des fruits) et `Fruit` (peut être contenue dans un autre contenant). Cela autorise les macédoines imbriquées de manière récursive tout en conservant une interface uniforme.

4. **Java 20 avec switch expressions** : les factories utilisent des switch expressions (`return switch (type) { ... }`) et l'interface `Fruit.Type` utilise le pattern matching sur le nom de classe. Ce sont des constructions modernes du langage Java.

5. **CI headless avec xvfb** : les tests GUI Swing s'exécutent dans GitHub Actions via `xvfb-run mvn test`, qui crée un display X virtuel. Cela permet de tester les composants Swing dans un environnement sans serveur d'affichage physique.

6. **Release automatisée** : le workflow `release.yml` compile, package un JAR renommé avec le titre de la PR, et publie une release GitHub automatique via `marvinpinto/action-automatic-releases`. Le processus de livraison est entièrement automatisé.

7. **Branches protégées** : la branche `main` exige une pull-request avec revue de code et passage des tests CI avant fusion. Ce garant de qualité est configuré côté GitHub.

8. **Exceptions métier typées** : `PanierPleinException`, `PanierVideException`, `MacedoineVideException`, `JusVideException` héritent de `RuntimeException` et sont interceptées dans le contrôleur principal pour affichage via `JOptionPane`.

---

## Extraits de code remarquables

### 1. Assemblage MVC dans le point d'entrée

**Fichier** : `src/main/java/org/vanadium/App.java`

```java
public App() {
    SelectContenantDialog selectContenantDialog = new SelectContenantDialog();
    selectContenantDialog.setVisible(true);

    vueg = new MainWindow();
    controleur = new ControleurMainWindow();
    ContenantFruitAbstract modele = selectContenantDialog.getContenantFruitAbstract();
    VueConsole vuec = new VueConsole();

    controleur.setModele(modele);
    modele.addObserver(vueg);
    modele.addObserver(vuec);
    vueg.addControleur(controleur);
}
```

Cet extrait montre la mise en place explicite du triptyque MVC. Le modèle est obtenu dynamiquement via un dialogue de sélection, puis les deux vues (graphique et console) sont attachées comme observatrices. Le contrôleur reçoit une référence au modèle. Cette séparation stricte permet d'ajouter de nouvelles vues sans modifier ni le modèle ni le contrôleur.

---

### 2. Pattern Observer — classe abstraite Observable

**Fichier** : `src/main/java/org/vanadium/model/ContenantFruitAbstract.java`

```java
public abstract class ContenantFruitAbstract
        extends Observable implements ContenantFruit {

    public void notifyObservers() {
        setChanged();
        super.notifyObservers(this);
    }
}
```

Cette classe abstraite fait le pont entre le contrat métier (`ContenantFruit`) et la capacité d'observation (`Observable`). Elle encapsule l'appel obligatoire à `setChanged()` avant notification, et passe `this` en argument pour que les observateurs reçoivent directement la référence du contenant modifié. Chaque sous-classe (`Panier`, `Jus`, `Macedoine`) appelle simplement `notifyObservers()` après chaque mutation.

---

### 3. Pattern Composite — la Macédoine

**Fichier** : `src/main/java/org/vanadium/model/Macedoine/Macedoine.java`

```java
public class Macedoine extends ContenantFruitAbstract implements Fruit {
    private HashMap<Fruit, Double> fruits;
    private double prix;
    private Pays origine;

    @Override
    public boolean isSeedless() {
        for (Map.Entry<Fruit, Double> entry : fruits.entrySet()) {
            if (!entry.getKey().isSeedless()) {
                return false;
            }
        }
        return true;
    }

    @Override
    public double getPrix() {
        if (prix > 0)
            return this.prix;
        else
            return getPrixTotal();
    }
```

La macédoine illustre le pattern Composite : elle est à la fois un `Fruit` (donc peut être ajoutée à un panier ou à une autre macédoine) et un `ContenantFruit` (donc peut contenir des fruits). La méthode `isSeedless()` délègue récursivement à chaque fruit contenu — la macédoine n'est « sans pépins » que si tous ses constituants le sont. Le prix peut être fixé manuellement ou calculé dynamiquement à partir des fruits contenus.

---

### 4. Factory de fruits avec switch expression

**Fichier** : `src/main/java/org/vanadium/factories/FactoryFruit.java`

```java
public class FactoryFruit {
    public static Fruit createFruit(Fruit.Type type) {
        return switch (type) {
            case ORANGE -> new Orange();
            case BANANE -> new Banane();
            case POMME  -> new Pomme();
            case MACEDEOINE -> new Macedoine();
            default     -> new Inconnue();
        };
    }
}
```

Cette factory centralise l'instanciation des fruits. Le switch expression (Java 14+) rend le code concis et exhaustif. L'ajout d'un nouveau type de fruit nécessite uniquement de modifier cette méthode et l'énumération `Fruit.Type`, sans toucher au code client.

---

### 5. Contrôleur principal avec gestion d'erreurs

**Fichier** : `src/main/java/org/vanadium/controler/ControleurMainWindow.java`

```java
public class ControleurMainWindow implements ActionListener {
    private ContenantFruitAbstract m;

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            if (((Component) e.getSource()).getName().equals("Plus")) {
                CreateFruitDialog dialog = new CreateFruitDialog();
                dialog.setVisible(true);
                if (dialog.getFruitItem() != null) {
                    m.ajout(dialog.getFruitItem());
                }
            } else {
                if (selectedFruits.size() > 0) {
                    for (Fruit fruit : selectedFruits) {
                        m.retrait(fruit);
                    }
                    selectedFruits.clear();
                } else {
                    m.retrait();
                }
            }
        } catch (Exception q) {
            JOptionPane.showMessageDialog(null,
                    q.getMessage(), "Erreur",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
}
```

Le contrôleur identifie l'action par le nom du composant source (« Plus » / « Moins ») et délègue au modèle. Toute exception métier (`PanierPleinException`, `PanierVideException`, etc.) est interceptée et présentée à l'utilisateur via une boîte de dialogue d'erreur Swing. Cette approche centralisée évite la dispersion de la gestion d'erreurs dans les vues.

---

### 6. Menu contextuel avec routage par commande

**Fichier** : `src/main/java/org/vanadium/controler/ControllerPopMenuList.java`

```java
@Override
public void actionPerformed(ActionEvent e) {
    if (m == null) return;
    List selectedFruits = list.getSelectedValuesList();
    switch (e.getActionCommand()) {
        case "Supprimer" -> {
            for (Object o : selectedFruits) {
                FruitItem f_item = (FruitItem) o;
                m.retrait(f_item.getFruit());
            }
        }
        case "Modifier" -> {
            FruitItem selectedFruit = (FruitItem) selectedFruits.get(0);
            AbstractModifyDialog dialog;
            if (selectedFruit.getFruit().getClass() == Macedoine.class) {
                dialog = new ModifyMacedoineDialog(selectedFruit);
                // ... montage MVC récursif pour la macédoine
            } else {
                dialog = new ModifyFruitDialog(selectedFruit);
            }
            dialog.setVisible(true);
            m.retrait(dialog.getOldFruitItem().getFruit());
            m.ajout(Map.entry(dialog.getNewFruitItem().getFruit(),
                              dialog.getNewFruitItem().getQuantity()));
        }
        case "Boycotter" -> {
            for (Object o : selectedFruits) {
                m.boycotteOrigine(((FruitItem) o).getFruit().getOrigine());
            }
        }
    }
}
```

Ce contrôleur gère les trois actions du menu contextuel (Supprimer, Modifier, Boycotter). Le cas « Modifier » est remarquable car il détecte dynamiquement si l'élément sélectionné est une macédoine et, si oui, monte un sous-MVC complet (modèle = la macédoine elle-même, vue = `ModifyMacedoineDialog`, contrôleur = nouveau `ControleurMainWindow`). Cela illustre une composition récursive du pattern MVC.

---

### 7. CI GitHub Actions avec GUI headless

**Fichier** : `.github/workflows/build.yml`

```yaml
name: Test with maven
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main", "release" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 20
        uses: actions/setup-java@v3
        with:
          java-version: '20'
          distribution: 'temurin'
          cache: maven
      - name: Test with Maven
        run: xvfb-run mvn -B test --file pom.xml
```

L'utilisation de `xvfb-run` est un choix technique important pour un projet Swing : les tests instancient des composants graphiques qui nécessitent un serveur X. En l'absence de display physique dans un runner CI, `xvfb` fournit un framebuffer virtuel. Cela garantit que les tests GUI s'exécutent de manière fiable en intégration continue.

---

## Qualité, sécurité, maintenance

### Tests

- **JUnit 5** + **Mockito** pour les tests unitaires. 10 classes de test couvrent les modèles (`Panier`, `Fruit`, `Jus`, `Macedoine`), les exceptions (`PanierPleinException`, `PanierVideException`) et les vues dialogues (`CreateFruitDialog`, `ModifyFruitDialog`, `SelectContenantDialog`, `VueConsole`).
- Mockito est utilisé pour mocker l'interface `Fruit` dans `PanierTest`, permettant de tester le panier indépendamment des implémentations concrètes de fruits.
- Le rapport PDF mentionne une couverture de code de 100 % sur les classes métier testées (mesurée via IntelliJ IDEA Coverage).

### CI/CD

- **Build CI** (`build.yml`) : déclenché sur push vers `main` et sur toute PR vers `main` ou `release`. Compile et exécute les tests Maven.
- **Release automatisée** (`release.yml`) : déclenchée sur push vers `release`. Compile, génère le JAR, le renomme avec le titre de la PR et publie une release GitHub avec tag automatique.
- Les branches `main` et `release` sont protégées : les modifications nécessitent une pull-request avec revue de code et passage des tests.

### Documentation

- **Javadoc** complète sur toutes les classes et méthodes publiques.
- **Doxygen** configuré via `Doxyfile` (projet nommé « Vanadium ») pour générer une documentation PDF.
- Rapport LaTeX disponible dans `documentation/latex/`.
- Diagrammes UML (Use Case, Classes, Séquence) au format `.drawio` dans `rapport/`.

### Gestion des erreurs

- Exceptions métier typées (`PanierPleinException`, `PanierVideException`, `MacedoineVideException`, `JusVideException`) avec messages explicites.
- Interception centralisée dans les contrôleurs avec affichage via `JOptionPane`.
- Protection contre les prix négatifs (inversion du signe dans les constructeurs de fruits).

---

## Installation et exécution (local)

### Prérequis

- **JDK 20** (Temurin ou équivalent)
- **Maven 3.x**
- Un serveur X (Linux natif, macOS Quartz, ou Xvfb pour headless)

### Compilation et exécution

```shell
# Cloner le dépôt
git clone https://github.com/Maxime-Cllt/Projet-GL.git
cd Projet-GL

# Compiler
mvn compile

# Lancer l'application
mvn exec:java

# Ou construire le JAR et l'exécuter
mvn package
java -jar target/Projet-GL-1.0-SNAPSHOT.jar
```

### Lancer les tests

```shell
mvn test
```

### Télécharger un build prêt à l'emploi

Les releases sont disponibles sur [GitHub Releases](https://github.com/Maxime-Cllt/Projet-GL/releases) :

```shell
java -jar Projet-GL-<version>.jar
```

---

## Liens

- **GitHub** : [https://github.com/Maxime-Cllt/Projet-GL](https://github.com/Maxime-Cllt/Projet-GL)
