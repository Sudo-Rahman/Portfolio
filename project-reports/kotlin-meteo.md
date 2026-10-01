# Kotlin Météo

![Kotlin Météo](https://raw.githubusercontent.com/Sudo-Rahman/kotlin-meteo/main/screen_app/meteo_1.png)

Une application météo Android écrite en Kotlin, avec les prévisions heure par heure et sur dix jours. C'est le projet qui m'a servi à apprendre le développement Android natif, juste avant de commencer mon alternance sur des applications Android.

## En bref

- **Contexte** : projet personnel d'apprentissage, été 2023.
- **Stack** : Kotlin, fragments Android, Retrofit, coroutines, Navigation, ViewBinding.
- **Données** : API Open-Meteo pour la météo, API Geoapify pour la recherche de villes.

## Liens

- [Code source](https://github.com/Sudo-Rahman/kotlin-meteo)

## Ce que fait l'application

- Prévisions des 24 prochaines heures : température, icône, probabilité de pluie.
- Prévisions sur dix jours, avec un écran détaillé par jour : lever et coucher du soleil, indice UV, vent, précipitations.
- Localisation par GPS ou recherche de ville avec suggestions au fil de la saisie.
- Dernière ville mémorisée et rechargée au démarrage.
- Fond et barre d'état qui changent selon qu'il fait jour ou nuit à l'endroit choisi.

![Kotlin Météo](https://raw.githubusercontent.com/Sudo-Rahman/kotlin-meteo/main/screen_app/meteo_2.png)

## Comment c'est construit

- **Une architecture en couches** : accès réseau, modèles, logique de présentation et écrans sont séparés.
- **Retrofit et coroutines** pour les appels réseau, rattachés au cycle de vie des écrans.
- **Navigation typée** : les écrans s'échangent des objets `Weather` rendus `Parcelable` avec `kotlin-parcelize`.
- **Fragments imbriqués** pour les blocs « par heure » et « par jour » de l'écran principal.
- **Localisation sans Google Play Services** : `LocationManager` et `Geocoder` suffisent, ce qui marche aussi sur les appareils sans services Google.
- **Jour et nuit selon l'API** : le thème suit le champ `is_day` d'Open-Meteo, pas le mode sombre du téléphone, pour correspondre à l'heure du lieu affiché.

## Limites

Avec le recul, plusieurs choses seraient à reprendre :

- Les erreurs réseau ne sont pas gérées : une requête qui échoue peut faire planter l'écran.
- La clé de l'API Geoapify est écrite dans le code.
- Il reste des `println` de débogage et aucun test réel.

## Ce que le projet montre

- Une première application Android complète : réseau, localisation, navigation, listes.
- Les bases que j'ai ensuite utilisées sur les applications SmartCity chez Sweepin.
