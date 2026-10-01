# gold-investment

Un site pour simuler un investissement dans l'or physique : on indique la quantité achetée, la durée et les versements réguliers, et le site projette la valeur année par année au cours actuel. Il comprend aussi un convertisseur entre plus de 170 devises.

## En bref

- **Contexte** : projet personnel en ligne, fin 2024.
- **Stack** : SvelteKit et Svelte 5, TypeScript, Tailwind CSS, ECharts, Docker.
- **Données** : cours des métaux et des devises fournis par l'API Metals.dev.

## Liens

- [Site en ligne](https://gold-investment.sudo-rahman.fr/)
- [Code source](https://github.com/Sudo-Rahman/gold-investment)

## Ce que fait le site

### Simulateur

- Projection de la valeur d'un stock d'or dans le temps, avec un graphique interactif.
- Versements mensuels ou annuels en plus de l'achat initial.
- Or 22 ou 24 carats, ce qui change le prix au gramme.
- Calcul optionnel de la zakat (2,5 % au-delà de 85 g), déductible de l'investissement.
- Évolution du cours sur les 30 derniers jours.
- Affichage dans la devise de son choix, et paramètres mémorisés dans le navigateur.

### Convertisseur de devises

- Conversion dans les deux sens entre deux devises.
- Une grille avec le taux de toutes les devises, filtrable par code ou par nom.

## Comment c'est construit

- **Les cours sont chargés côté serveur** et mis en cache dans un fichier JSON pour la journée. Le cours de l'or ne change pas assez vite pour justifier une base de données, et le cache évite de dépasser le quota de l'API.
- **La clé d'API reste sur le serveur** : seules les données utiles sont transmises à la page.
- **Les réponses de l'API sont typées** en TypeScript.
- **Les graphiques** (ECharts) se recalculent dès qu'un paramètre change, grâce aux runes de Svelte 5.
- **Déploiement** : à chaque push, GitHub Actions construit l'image Docker, la publie et la redéploie sur le serveur par SSH.

## Limites

- Pas de tests automatisés.
- Si l'API ne répond pas et qu'aucun cache n'existe, la page affiche des données incomplètes sans message d'erreur.

## Ce que le projet montre

- Un petit produit web en production, du code au déploiement automatisé.
- Une façon simple de gérer une API limitée en quota avec un cache côté serveur.
