# MediaFlow

MediaFlow est une application desktop pour tout ce qu'on fait habituellement avec cinq outils différents sur des fichiers vidéo : extraire une piste, ajouter des sous-titres, convertir un format, transcrire l'audio, récupérer des sous-titres incrustés, traduire un fichier de sous-titres ou renommer une saison entière. Elle tourne sur macOS, Windows et Linux, et elle est distribuée sur le Microsoft Store, sur son site et sur GitHub.

## En bref

- **Type** : logiciel desktop publié, version 1.0.6 (août 2026).
- **Stack** : Rust et Tauri 2 pour le cœur, Svelte 5 et TypeScript pour l'interface, FFmpeg pour le traitement média.
- **Modèle** : outils locaux gratuits ; fonctions assistées par IA payées avec des crédits.
- **Code** : public, sous licence non commerciale (MNCL 1.0).

## Liens

- [Site et documentation](https://mediaflowtools.com/)
- [Microsoft Store](https://apps.microsoft.com/detail/9n0180zrqn56)
- [Tarifs](https://mediaflowtools.com/pricing)
- [Code source et versions](https://github.com/Sudo-Rahman/MediaFlow)

## Le besoin

Quand on prépare des vidéos, en particulier des séries avec plusieurs pistes audio et sous-titres, on jongle entre FFmpeg en ligne de commande, MKVToolNix, un outil d'OCR, un traducteur et un renommeur. MediaFlow regroupe ces étapes dans une seule interface et permet de vérifier chaque résultat (pistes, noms de fichiers, sous-titres, traductions) avant d'écrire quoi que ce soit sur le disque.

## Les outils

| Outil | Rôle |
| --- | --- |
| Extraction de pistes | Sortir les pistes audio, vidéo ou sous-titres d'un MKV, MP4, MOV… |
| Fusion | Ajouter des sous-titres ou des pistes audio externes à une vidéo, par lots |
| Transcodage | Convertir pour la lecture, le montage, l'archivage ou un fichier plus léger |
| Audio vers sous-titres | Générer des sous-titres SRT ou VTT à partir de la parole |
| OCR vidéo | Lire les sous-titres incrustés directement dans l'image |
| OCR de sous-titres | Convertir des sous-titres image (PGS, VobSub) en texte éditable |
| Traduction | Traduire des fichiers SRT, ASS, VTT ou SSA en gardant le minutage |
| Renommage par lots | Renommer ou copier des fichiers avec un aperçu avant application |
| Informations | Afficher codecs, flux, langues, débit et métadonnées sans modifier le fichier |

Les outils locaux (extraction, fusion, transcodage, renommage, informations) fonctionnent sans compte. La traduction, la transcription et les suggestions de transcodage passent par l'API MediaFlow et consomment des crédits.

## Comment c'est construit

### Le cœur en Rust

Le backend Tauri est découpé en modules par outil (`ffmpeg`, `ffprobe`, `merge`, `transcode`, `ocr`, `subtitle_ocr`, `transcription`, `translation`…). FFmpeg et FFprobe sont embarqués comme binaires annexes, mis en cache dans la CI. Chaque traitement long remonte sa progression à l'interface, peut être annulé, et empêche la mise en veille de la machine tant qu'il tourne.

### OCR local

L'OCR utilise les modèles PaddleOCR v5 (détection et reconnaissance), convertis au format MNN et livrés avec l'application, avec des modèles pour le latin, le cyrillique, l'arabe, le coréen, le thaï, le tamoul, le télougou, le grec et le devanagari. Les images sont extraites par FFmpeg et traitées sur la machine, avec accélération Metal sur macOS. Les dernières versions ont surtout porté sur la mémoire : borner la consommation pendant les gros lots et libérer correctement les ressources Metal.

### Fonctions IA et crédits

L'application se connecte à un compte MediaFlow. Les appels IA passent par une API SvelteKit adossée à Convex, qui choisit le fournisseur (OpenRouter ou OpenAI) derrière trois niveaux de modèle stables : Lite, Medium et High. Avant chaque appel, l'API réserve une estimation de crédits en fonction des tokens d'entrée, puis débite le coût réel rapporté par le fournisseur. Un compteur d'usage est affiché dans l'application.

### Interface

L'interface Svelte 5 est une application à page unique : chaque outil a son espace de travail, on peut glisser-déposer des fichiers d'un outil à l'autre, et tous les traitements en cours s'affichent dans une progression commune.

## Qualité et livraison

- 95 fichiers Rust côté backend, avec des fichiers média de test, et 78 fichiers de tests TypeScript.
- Intégration continue sur macOS, Windows et Linux.
- Builds de release signés pour macOS et Windows, publiés automatiquement sur GitHub.
- Publication sur le Microsoft Store.

## Ce que le projet montre

- Un produit desktop multiplateforme livré, distribué et facturé.
- L'intégration d'outils système lourds (FFmpeg, OCR) dans une application Tauri, avec annulation et gestion de la mémoire.
- Un système de crédits pour refacturer l'usage de modèles d'IA au coût réel.
