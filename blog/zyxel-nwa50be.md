# Zyxel NWA50BE

## Pourquoi cette borne

J'habite à **Chalon-sur-Saône**, dans une maison à deux niveaux : le rez-de-chaussée est un **garage**, la partie habitable est à l'étage. Là-haut, j'ai déjà un routeur **Wi-Fi 7 tri-bande, l'Asus RT-BE92U**. Il couvre très bien la maison, mais dans le garage, là où se trouve mon **tapis de course**, c'est une autre histoire : je capte une barre, le débit est très faible et le Wi-Fi se déconnecte. Impossible de regarder une série tranquillement pendant une séance de running.

Je ne voulais pas remplacer mon routeur ni ajouter un système maillé. Il me fallait juste un **point d'accès** à poser dans le garage, relié par **un seul câble** à mon rack et à mon switch PoE, avec **le même SSID et le même mot de passe** que le routeur principal. Mon téléphone passe alors d'une borne à l'autre en descendant au garage, et je peux regarder mes vidéos en pleine qualité en courant.

Sur le papier, la Zyxel NWA50BE coche tout : Wi-Fi 7 double bande, un port **2,5 GbE**, alimentation PoE+, et un prix de **77 €** sur Amazon.

C'est le premier test du labo, et c'est un test d'usage : j'ai déballé, installé chez moi, branché sur mon rack, puis mesuré. Pas de banc d'essai en chambre sourde, juste ce qu'on vit vraiment une fois la borne au plafond.

## Déballage et contenu

La boîte verte Zyxel est sobre. À l'intérieur, tout est rangé proprement et rien de superflu :

- la borne, sous film ;
- un **quick start guide** et les fiches réglementaires ;
- un **bloc secteur 12 V** avec embouts interchangeables (EU et UK), pour qui n'a pas de switch PoE ;
- un **support de fixation en métal**, avec **vis et chevilles**.

![Le bloc secteur 12 V et ses deux embouts interchangeables.](/blog/zyxel-nwa50be/p81.jpg)
![Le support de fixation, ses vis et ses chevilles.](/blog/zyxel-nwa50be/p80.jpg)

## Le boîtier

La NWA50BE est un carré blanc de **150 × 150 mm pour 35 mm d'épaisseur** et **412 g**. Sur la face avant, le logo Zyxel et une fine barre lumineuse, c'est tout : aucune antenne ne dépasse, elle se fait oublier au plafond.

Le dessous concentre la connectique : un port **console**, le port **UPLINK** RJ-45 (1 / 2,5 Gb/s, c'est lui qui reçoit le PoE+) et l'entrée **DC 12 V**. Un seul câble réseau suffit donc.

![Face avant : sobre, une barre lumineuse.](/blog/zyxel-nwa50be/p77.jpg)
![Console, UPLINK et alimentation 12 V.](/blog/zyxel-nwa50be/p78.jpg)

## Installation

Le point fort de ce produit, c'est son installation. Le support se visse au mur ou au plafond, puis le boîtier **se clipse dessus** sans outil. Le support est vraiment propre : rigide, bien dessiné, avec vis et chevilles fournies.

Chez moi, il fallait tirer un câble depuis le rack jusqu'au garage, puis sertir une prise RJ45. Côté rack, la borne se branche sur un **switch PoE** : pas de bloc secteur, pas de prise électrique à proximité. C'est précisément l'intérêt du PoE, et le meilleur argument pour une borne au plafond.

![Le câble est tiré dans le faux plafond.](/blog/zyxel-nwa50be/p83.jpg "portrait")
![Le switch PoE dans le rack.](/blog/zyxel-nwa50be/p87.jpg "portrait")

![Sertissage de la prise RJ45.](/blog/zyxel-nwa50be/p89.jpg)
![La borne clipsée sur son support.](/blog/zyxel-nwa50be/p85.jpg "portrait")

Une fois posée, elle est discrète et propre. Je n'ai rien eu à bricoler.

![La NWA50BE en place, de près.](/blog/zyxel-nwa50be/p90.jpg "portrait")

## L'interface : le point noir

Voilà ce que je n'aime pas. L'interface web **standalone** est franchement laide : on dirait un produit de l'époque de Windows 2000, avec ses fenêtres grises, ses menus en arbre et ses boîtes de dialogue d'un autre temps. Elle fait le travail, mais l'expérience n'a rien de moderne, surtout face à une borne vendue comme Wi-Fi 7.

Zyxel propose aussi une gestion cloud **Nebula** (la borne est NebulaFlex), mais je suis resté en standalone pour ce test. Le tableau de bord affiche bien l'essentiel : charge CPU, mémoire, état des deux radios et lien filaire.

![Connexion à l'interface de la borne.](/blog/zyxel-nwa50be/ui-2.webp)
![Le tableau de bord : tout est là, mais l'esthétique date.](/blog/zyxel-nwa50be/ui-3.webp)

La configuration passe par l'assistant (Wizard) de la borne. Les deux radios sont activées en mode AP, et un même profil SSID diffuse sur les bandes **2,4 GHz et 5 GHz**. Dans mon cas, la radio 5 GHz tourne sur le canal 44 en 160 MHz.

![Réglages des deux radios et profils SSID.](/blog/zyxel-nwa50be/ui-1.webp)
![Édition du profil SSID : sécurité, VLAN, isolation, QoS.](/blog/zyxel-nwa50be/ui-4.webp)

## Performances

J'ai mesuré depuis un iPhone 17 Pro connecté en Wi-Fi 5 GHz, à environ **5 mètres de la borne**, sur une fibre Orange, avec deux outils : **Speedtest** (Ookla) et **nPerf**.

| Mesure | Speedtest | nPerf |
| --- | --- | --- |
| Descendant | 917 Mb/s | 953 Mb/s |
| Ascendant | 787 Mb/s | 872 Mb/s |
| Latence | 11 ms | 18 ms |

nPerf donne en plus un score de **180 952 nPoints**, avec 87,82 % en navigation et 95,97 % en streaming vidéo. Les débits sont excellents.

![Résultat Speedtest : 917 Mb/s en réception, 787 Mb/s en envoi.](/blog/zyxel-nwa50be/speedtest-ookla.jpg "phone")
![Résultat nPerf : 953 Mb/s en réception, 872 Mb/s en envoi.](/blog/zyxel-nwa50be/speedtest-nperf.jpg "phone")

La latence dépend du serveur choisi. Depuis Chalon, le serveur Speedtest de **Strasbourg** répond en **11 ms**, contre **18 ms** sur le serveur Anycast Orange de nPerf. Plus le serveur est loin, plus le ping monte.

### Streaming : un film de 11 Go à 15 mètres

Les speed tests sont une chose, l'usage en est une autre. J'ai donc lancé en streaming un **film de 11 Go**, avec un débit d'environ **30 Mb/s**, en m'éloignant à **15 mètres** de la borne. Résultat : **aucun lag, rien du tout**. La lecture est restée parfaitement fluide.

### Le gigabit est saturé

Je pense que je **sature le gigabit**. La borne est branchée sur un **switch PoE gigabit** : le tableau de bord indique d'ailleurs un lien UPLINK négocié à **1000 Mb/s**. Les résultats, entre 917 et 953 Mb/s en réception, sont donc très proches du plafond de ce port, pas de celui du Wi-Fi.

Il faut le dire clairement : **je n'ai pas testé la borne en 2,5 Gb/s**. Je ne l'ai pas branchée sur un switch 2,5 GbE, donc je ne sais pas jusqu'où elle peut monter. Il s'agit en outre d'un seul appareil, ce n'est pas un test de charge avec de nombreux clients.

## Prix et concurrence

C'est là que la NWA50BE fait la différence. Je l'ai payée **77 €** sur Amazon. À ma connaissance, les concurrents équivalents (Wi-Fi 7 double bande avec un port 2,5 GbE) démarrent à **100 €** au minimum : **20 à 30 € d'écart**. Je n'ai pas trouvé mieux à ce tarif.

## Verdict

Le produit est excellent : installation facile, support propre, PoE, débits au rendez-vous, et un prix que je n'ai vu nulle part ailleurs pour du Wi-Fi 7 avec 2,5 GbE. Je lui mets **8,5 sur 10**. Elle perd son demi-point (voire plus) à cause de **l'interface web**, qui gâche un peu l'impression d'un produit moderne.

Si vous cherchez une borne Wi-Fi 7 pour combler une zone mal couverte, sans vous ruiner, et que vous avez un switch PoE, **foncez**.
