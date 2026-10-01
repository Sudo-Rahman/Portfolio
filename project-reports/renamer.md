# renamer

renamer est un logiciel de renommage de fichiers par lots, pour les photographes, monteurs ou développeurs qui doivent renommer des centaines de fichiers d'un coup. C'est mon premier logiciel vendu. La première version, sur Windows, macOS et Linux, vendait des licences via Stripe. La deuxième est publiée sur le Mac App Store sous le nom **Renamer Pro**.

## En bref

- **Type** : logiciel desktop publié.
- **Stack** : Rust et Tauri 2, SvelteKit et TypeScript ; API Rust/Axum avec MongoDB pour la v1.
- **Distribution** : licences Stripe (v1, 2025), puis Mac App Store (v2, depuis fin 2025).
- **Code** : la v1 est publique sous licence AGPL v3, la v2 est privée.

## Liens

- [Site web](https://renamer.sudo-rahman.fr/)
- [Renamer Pro sur le Mac App Store](https://apps.apple.com/us/app/renamer-pro/id6753810633?mt=12)
- [Code source de la v1](https://github.com/Sudo-Rahman/renamer)

## Ce que fait le logiciel

On dépose des fichiers, on empile des règles de renommage, et on voit le nouveau nom de chaque fichier se mettre à jour avant d'appliquer quoi que ce soit.

- Neuf types de règles, combinables et réordonnables par glisser-déposer : numérotation, casse (minuscules, `snake_case`, `kebab-case`…), insertion de texte, remplacement par expression régulière, suppression, date de création, taille du fichier, extension, nom d'origine.
- Détection des conflits avant application : doublons, noms invalides, fichiers disparus.
- Préréglages pour réutiliser une combinaison de règles.
- Annulation d'un renommage (v2).
- Interface en français et en anglais.

## La v1 : vendre soi-même ses licences

La première version embarquait toute la partie commerciale :

- **Application Tauri** : gratuite jusqu'à 5 fichiers, débloquée par une licence. Mise à jour automatique intégrée.
- **API Rust (Axum)** avec MongoDB : création des licences, activation par machine (jusqu'à 5), synchronisation des préréglages.
- **Paiement Stripe** avec vérification de signature des webhooks, et e-mails de licence envoyés via Mailgun.
- **Site de vente** en SvelteKit.

Quelques choix techniques :

- Les types partagés entre l'API et l'application sont écrits une seule fois en Rust ; `ts-rs` génère les interfaces TypeScript correspondantes.
- Une petite couche d'accès à MongoDB écrite à la main, avec des migrations qui ajoutent les champs manquants aux anciens documents.
- Limitation du nombre de requêtes par IP, CORS restreint au domaine du site en production.
- Une image Docker de l'API construite `FROM scratch` : un binaire Rust compilé statiquement, et rien d'autre.
- Builds GitHub Actions pour macOS (binaire universel signé), Windows (x86 et ARM) et Linux (AppImage, DEB, RPM), et déploiement de l'API et du site par SSH.

## La v2 : passer par le Mac App Store

Gérer soi-même paiements, licences et serveur coûte cher en maintenance pour un petit utilitaire. La v2 supprime l'API et confie la vente au Mac App Store. Il a fallu adapter l'application au bac à sable macOS (accès aux fichiers choisis par l'utilisateur, erreurs de permission affichées dans une boîte de dialogue native) et retirer la mise à jour automatique, que l'App Store interdit. La v2 ajoute aussi l'annulation d'un renommage.

## Limites

La v1 n'avait pas de suite de tests automatisés, ni de linter configuré dans le dépôt.

## Ce que le projet montre

- Un premier produit vendu, du code au paiement.
- Une chaîne de vente complète : Stripe, licences, e-mails, mises à jour automatiques.
- Le passage d'une distribution maison à l'App Store, avec les contraintes du bac à sable macOS.
