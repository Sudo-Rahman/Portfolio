# linkKeep

linkKeep est une application Apple (iPhone, iPad et Mac) pour ranger les liens qu'on veut garder : articles à lire, documentation, outils, recettes. Les liens sont classés en catégories et en dossiers, avec des notes, des rappels et une vérification automatique des liens morts. L'application est publiée sur l'App Store en freemium ; le code source est privé.

## En bref

- **Type** : application iOS, iPadOS et macOS publiée, version 1.1 (septembre 2026).
- **Stack** : Swift 6, SwiftUI, Core Data avec CloudKit, package Swift partagé ; site en SvelteKit.
- **Modèle** : gratuit jusqu'à 1 catégorie et 10 liens, version Pro illimitée.
- **Langues** : 10, dont le français, l'anglais, le japonais et le turc.

## Liens

- [Site web](https://linkkeep.sudo-rahman.fr/)
- [linkKeep sur l'App Store](https://apps.apple.com/app/id6760005462)

## Le besoin

Les favoris des navigateurs deviennent vite une liste illisible, et ils ne suivent pas d'un navigateur à l'autre. linkKeep sert de bibliothèque de liens commune à tous les appareils Apple, avec de quoi retrouver un lien et savoir s'il fonctionne encore.

## Ce que fait l'application

- Organiser les liens en catégories (icône, couleur) et en dossiers, avec notes, épinglage et archivage.
- Ajouter un lien depuis n'importe quelle application grâce à l'extension de partage, ou depuis une URL copiée.
- Vérifier régulièrement que les liens répondent encore et signaler ceux qui sont morts.
- Programmer un rappel pour relire un lien à une date donnée.
- Verrouiller certaines catégories avec Face ID ou Touch ID.
- Ouvrir les liens dans un navigateur intégré, avec historique local et navigation privée.
- Synchroniser via iCloud, et exporter ou importer toute la bibliothèque dans un fichier `.linkkeep`.

## Comment c'est construit

Le dépôt contient deux projets : les applications Apple et le site.

### Un cœur partagé entre iOS et macOS

Les applications iOS et macOS partagent un package Swift, `LinkKeepCore`, organisé en quatre couches :

- **Domain** : les types métier (lien, catégorie, dossier, offre), les règles (quotas, normalisation d'URL) et les interfaces des dépôts de données. Aucune dépendance autre que Foundation.
- **Data** : l'implémentation Core Data de ces interfaces, avec synchronisation CloudKit.
- **Services** : la vérification des liens, les rappels, l'export et l'import, le verrouillage biométrique, l'abonnement.
- **SharedUI** : le design system et les composants SwiftUI communs.

Une règle simple tient l'ensemble : pas de `#if os(iOS)` ni de `#if os(macOS)` dans le code partagé. Ce qui dépend de la plateforme (retour haptique, ouverture d'URL, vue web) passe par des protocoles définis dans le cœur et implémentés dans chaque application.

### Vérification des liens

Le service de santé des liens envoie des requêtes HTTP en parallèle, en limitant le nombre de requêtes par domaine et en espaçant les nouvelles tentatives après un échec. Chaque lien est classé comme actif, mort ou invérifiable, et un résumé est affiché à la fin.

### Le site

Le site de présentation est en SvelteKit et Svelte 5, traduit avec Paraglide, avec les balises SEO et les données structurées de l'application. Il est déployé dans un conteneur Docker.

## Qualité

- Tests Swift (Swift Testing) sur le domaine, les données et les services : quotas, export, rappels, protection de la catégorie Favoris.
- Environnement de debug isolé de l'application publiée.
- Écran de confidentialité qui masque le contenu quand l'application passe en arrière-plan.

## Ce que le projet montre

- Une application Apple publiée sur trois plateformes avec une seule base de code partagée.
- Une architecture en couches qui garde le code métier testable et indépendant de l'interface.
- La gestion d'un produit freemium : paywall, quotas, localisation en dix langues, site et fiche App Store.
