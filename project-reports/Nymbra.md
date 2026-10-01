# Nymbra

![Accueil du coffre Nymbra](https://nymbra.sudo-rahman.fr/app-screens/en-US/01-vault-home-1284.webp)

Nymbra est un coffre-fort pour iPhone. On y range les fichiers qu'on ne veut pas laisser traîner dans la pellicule ou le dossier Fichiers : pièces d'identité, justificatifs, scans, photos privées, enregistrements audio. L'accès est protégé par Face ID et les fichiers sont chiffrés. L'application est publiée sur l'App Store ; le code source est privé.

## En bref

- **Type** : application iPhone publiée (catégorie Utilitaires), version 1.0.1 (juillet 2026).
- **Stack** : Swift et SwiftUI, avec un site en SvelteKit.
- **Données** : stockage local par défaut, synchronisation iCloud au choix, aucun compte.

## Liens

- [Site web](https://nymbra.sudo-rahman.fr/)
- [Nymbra sur l'App Store](https://apps.apple.com/us/app/nymbra/id6783014745)

## Le besoin

Un scan de passeport ou un relevé bancaire n'a rien à faire au milieu des photos de vacances. Nymbra crée une copie protégée du fichier dans son coffre, puis permet de le retrouver, de le prévisualiser et de l'exporter quand on en a besoin.

## Ce que fait l'application

- Importer des documents, images, vidéos, scans, archives et fichiers audio, depuis l'application Fichiers, la photothèque ou l'extension de partage.
- Classer automatiquement les éléments par type, avec recherche, aperçu rapide et favoris.
- Ouvrir le coffre avec Face ID ou Touch ID, avec un verrouillage automatique réglable.
- Garder le fichier d'origine intact : supprimer un élément du coffre ne touche pas à la source.
- Activer, si on le souhaite, la synchronisation iCloud des fichiers chiffrés entre ses appareils.

![Import de fichiers](https://nymbra.sudo-rahman.fr/app-screens/en-US/02-add-import-1284.webp)

![Réglages de sécurité](https://nymbra.sudo-rahman.fr/app-screens/en-US/08-security-settings-1284.webp)

## Choix produit

- **Pas de compte, pas de serveur** : le contenu du coffre ne passe jamais par une infrastructure Nymbra. Sans iCloud, tout reste sur l'iPhone.
- **Une interface sobre** : un accueil qui résume le coffre, une navigation par type de fichier et les actions principales à portée de main.
- **Un parcours complet** : découverte sur le site, installation, première importation, verrouillage, recherche et export.

## Autour de l'application

Le site présente l'application, son fonctionnement et sa politique de confidentialité, avec une page de support et une FAQ. Les captures et les textes de la fiche App Store sont gérés dans le dépôt.

## Ce que le projet montre

- La publication d'une application iOS complète sur l'App Store.
- Un produit pensé autour de la confidentialité : chiffrement, biométrie, données locales.
- La partie autour du code : site, SEO, pages légales, support et fiche App Store.
