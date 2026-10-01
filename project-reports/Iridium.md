# Iridium

![Iridium](https://raw.githubusercontent.com/Sudo-Rahman/Iridium/main/resources/preview.png)

Iridium est un gestionnaire de fichiers pour le cloud : Google Drive, OneDrive, Dropbox, Mega, SFTP, SMB et d'autres, dans une seule fenêtre à deux panneaux. Il s'appuie sur rclone pour les transferts. Toute la gestion de rclone passe par [rclone_cpp](/projects/rclone_cpp), une bibliothèque que j'ai écrite à part pour ne pas coupler l'application à rclone. [Ultra Explorer](/projects/UltraExplorer) en est la deuxième version, réécrite en Rust.

## En bref

- **Contexte** : projet personnel open source, 2023-2024.
- **Stack** : C++23, Qt 6 (Widgets), Boost, Conan, CMake, rclone.
- **Taille** : environ 12 000 lignes de C++ réparties sur 144 fichiers.
- **Licence** : GPLv3.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Iridium)

## Le besoin

Chaque service de stockage a sa propre interface web, et rclone, qui sait parler à plus de quarante d'entre eux, s'utilise en ligne de commande. Iridium ajoute l'interface graphique : on configure ses stockages une fois, puis on navigue et on transfère entre eux comme dans un explorateur classique.

## Ce que fait l'application

- Configuration guidée de 14 types de stockage, dont Google Drive, OneDrive, Dropbox, Mega, FTP, SFTP, SMB, pCloud et Box.
- Un explorateur à deux panneaux : copier, couper, coller, renommer, supprimer, glisser-déposer d'un stockage à l'autre, aperçu des images.
- Une recherche sur plusieurs stockages en même temps, avec filtres d'inclusion et d'exclusion.
- La synchronisation d'un dossier, avec la liste des différences affichée avant de lancer.
- Un gestionnaire de tâches : progression fichier par fichier, vitesse, temps restant, annulation, erreurs par fichier.
- Thème clair ou sombre selon le système, interface en français et en anglais.

![Explorateur à deux panneaux](https://raw.githubusercontent.com/Sudo-Rahman/Iridium/main/screen/screen1.png)

## Comment c'est construit

- **rclone en coulisses** : chaque opération lance rclone via ma bibliothèque rclone_cpp, qui lit sa sortie JSON au fil de l'eau. Le nombre de processus simultanés est limité au nombre de cœurs de la machine.
- **Mise à jour de l'interface depuis les threads de travail** : la progression arrive sur des threads séparés, et chaque mise à jour est renvoyée sur le fil principal de Qt avec `QMetaObject::invokeMethod`.
- **Des tâches en arbre** : copier un dossier crée une tâche parente et une sous-tâche par fichier, ce qui permet d'afficher la progression globale et le détail.
- **Dépendances gérées avec Conan** : Boost, libcurl, libzip et rclone_cpp, pour un build reproductible.
- **Rendu soigné des listes** : les icônes des résultats de recherche et de synchronisation sont mises en cache pour ne pas être recréées à chaque affichage.

Un workflow GitHub Actions construit un paquet Debian et publie une préversion à chaque tag.

## Limites

- Pas de tests automatisés.
- Seule la compilation Linux est automatisée ; macOS et Windows se compilent à la main.
- Une interface Qt Widgets est longue à faire évoluer, ce qui m'a poussé à repartir sur Tauri et Rust pour Ultra Explorer.

## Ce que le projet montre

- Une application desktop C++/Qt complète, multithreadée et multiplateforme.
- L'intégration d'un outil en ligne de commande dans une interface graphique.
