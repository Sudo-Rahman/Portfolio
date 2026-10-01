# KARA

![KARA, inventaire de métaux précieux](https://raw.githubusercontent.com/Sudo-Rahman/KARA/main/docs/readme/kara-readme-hero.png)

KARA est une application iPhone pour tenir l'inventaire de ses métaux précieux : lingots, pièces, bijoux. Pour chaque objet, on note le poids, la pureté, le prix d'achat et l'endroit où il est rangé. L'application estime ensuite sa valeur au cours du marché et suit son évolution. Elle est publiée sur l'App Store depuis l'été 2026. La version Android est en préparation.

## En bref

- **Type** : application iOS publiée, avec un site web et une API.
- **Stack** : Swift, SwiftUI, SwiftData, CloudKit, WidgetKit ; SvelteKit, TypeScript et Redis côté serveur.
- **Code** : public, sous licence PolyForm Noncommercial.
- **Version** : 1.1.1 (septembre 2026).

## Liens

- [Site web](https://kara.sudo-rahman.fr/)
- [KARA sur l'App Store](https://apps.apple.com/app/id6795243977)
- [Code source sur GitHub](https://github.com/Sudo-Rahman/KARA)

## Le besoin

Quand on achète de l'or ou de l'argent physique, on finit vite avec des factures dans un tiroir, des certificats dans un autre, et aucune idée de ce que vaut l'ensemble aujourd'hui. Les applications existantes demandent souvent un compte et envoient l'inventaire sur leurs serveurs. KARA garde tout sur le téléphone et n'a pas de compte.

## Ce que fait l'application

- Enregistrer chaque objet : poids, pureté, quantité, prix d'achat, emplacement, notes et étiquettes.
- Estimer la valeur du métal à partir des cours disponibles, et suivre la performance dans le temps.
- Voir la répartition par métal et fixer des objectifs.
- Simuler une vente : choisir des objets et des quantités pour estimer le produit et la plus-value, sans toucher à l'inventaire.
- Joindre photos, factures et certificats, et générer un rapport PDF directement sur l'appareil.
- Afficher les cours et la valeur du portefeuille dans des widgets.
- Protéger l'accès avec Face ID, Touch ID ou le code de l'appareil, et masquer les montants.

![Coffre](https://raw.githubusercontent.com/Sudo-Rahman/KARA/main/website/static/landing/screens/fr/01-coffre.webp)

![Performance](https://raw.githubusercontent.com/Sudo-Rahman/KARA/main/website/static/landing/screens/fr/04-performance.webp)

## Comment c'est construit

Le dépôt regroupe l'application, le site et l'API.

| Dossier | Technologies | Contenu |
| --- | --- | --- |
| `apple/` | SwiftUI, SwiftData, CloudKit, WidgetKit | Application iPhone, widgets et tests |
| `website/` | SvelteKit, Svelte 5, TypeScript, Redis | Site bilingue et API utilisée par l'application |
| `website/data-pipeline/` | TypeScript, GitHub Actions | Collecte et publication mensuelle des cours des métaux |
| `shared/` | JSON | Catalogue d'actifs commun aux plateformes |

### Les données restent sur l'appareil

L'inventaire est stocké avec SwiftData et peut être synchronisé dans la base iCloud privée de l'utilisateur. Le serveur ne reçoit jamais l'inventaire : il ne fournit que les cours.

### Une API protégée sans compte utilisateur

Sans compte, il faut quand même empêcher n'importe qui d'appeler l'API. Les requêtes de l'application sont authentifiées avec **App Attest**, qui prouve qu'elles viennent d'une copie authentique de l'application. Le serveur limite le débit par installation et par adresse IP. Les deux sont pseudonymisés avec un HMAC avant d'être utilisés comme clés Redis.

### Des widgets qui se mettent à jour seuls

Une extension de widget ne peut pas utiliser App Attest. Après une première requête authentifiée, le serveur délivre donc un jeton en lecture seule, valable uniquement sur la route des cours pour widgets. Redis n'en garde que l'empreinte SHA-256. Le widget récupère lui-même les cours et recalcule la valeur du portefeuille en local, sans envoyer l'inventaire.

### Saisie assistée depuis une photo

Une option, désactivée par défaut, permet de remplir une fiche à partir d'une photo ou d'une facture. Seul le fichier choisi est envoyé à un modèle OpenAI, via le serveur. Les médias et les données extraites ne sont jamais journalisés.

## Qualité et livraison

- Une quarantaine de fichiers de tests côté iOS (unitaires, interface, widgets) et autant côté site et API (tests unitaires et Playwright).
- Audit Lighthouse du site, build de production bloqué si la configuration est incomplète.
- Image Docker multi-étapes déployée avec Dokploy.
- Cours des métaux mis à jour chaque mois par un workflow GitHub Actions.

## Ce que le projet montre

- Une application iOS native livrée sur l'App Store, avec widgets, synchronisation iCloud et protection biométrique.
- Une conception orientée vie privée : pas de compte, pas d'inventaire côté serveur, identifiants pseudonymisés.
- La sécurisation d'une API publique avec App Attest et de la limitation de débit.
- La gestion complète d'un produit : site bilingue, fiches App Store, notes de version.
