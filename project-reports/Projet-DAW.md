# Neptune (Projet-DAW)

Neptune est une plateforme d'apprentissage en ligne : des cours, des QCM notés et un forum. Réalisée à trois (avec Maxime Colliat et Yoan Dusoleil) pour le module Développement d'Applications Web, en PHP sans framework et avec PostgreSQL.

## En bref

- **Contexte** : projet universitaire, Licence 3 Informatique, 2023.
- **Stack** : PHP, PostgreSQL, JavaScript et jQuery, Docker.
- **Équipe** : 3 personnes.

## Liens

- [Code source](https://github.com/Sudo-Rahman/Projet-DAW)

## Ce que fait la plateforme

### Pour les apprenants

- Inscription et connexion, profil avec photo et statistiques (QCM passés, moyenne, meilleure note, messages).
- Des cours composés de titres, paragraphes, images, vidéos YouTube et liens vers des QCM.
- Des QCM chronométrés, notés sur 20, dont le résultat est conservé et mis à jour si on les repasse.
- Un forum : créer un sujet, répondre, supprimer ses propres messages.

### Pour les administrateurs

- Un tableau de bord avec les chiffres de la plateforme.
- La recherche et la suppression d'utilisateurs.
- Un éditeur de cours visuel : clic droit pour ajouter un titre, un paragraphe, une image, une vidéo ou un QCM.
- Un formulaire de création de QCM.

## Comment c'est construit

- **Un MVC écrit à la main** : toutes les requêtes passent par `index.php`, qui charge le contrôleur et l'action demandés. Le but du module était justement de comprendre ce qu'un framework fait à notre place.
- **PostgreSQL dans Docker**, avec un schéma relationnel complet. Quand un utilisateur est supprimé, un trigger PL/pgSQL anonymise ses messages au lieu de casser les fils de discussion.
- **Des requêtes préparées** (PDO) partout, contre les injections SQL.
- **Les QCM sont stockés en XML et les cours en JSON**, ce qui permet de les générer depuis l'interface d'administration.
- **jQuery** pour la validation des formulaires en AJAX, les fenêtres modales et le menu contextuel de l'éditeur.
- **Thème clair et sombre**, qui suit le réglage du système par défaut.

## Limites

Avec le recul :

- Les mots de passe sont hachés en SHA-256 avec un sel. C'est mieux que rien, mais bcrypt ou Argon2 seraient le bon choix.
- Les identifiants de la base sont écrits dans le code.
- Certaines vues font elles-mêmes des requêtes en base, ce qui mélange les couches.
- Pas de tests automatisés.

## Ce que le projet montre

- Le fonctionnement d'une application web sans framework : routage, sessions, contrôleurs, vues.
- La conception d'une base relationnelle avec des contraintes et des triggers.
