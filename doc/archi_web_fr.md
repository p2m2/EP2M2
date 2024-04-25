<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: CC-BY-NC-4.0
-->

# Architecture du site web

## Layout par défaut

Ce layout sera présent sur toute les pages du site.

### Description
![layout par défaut!](./ressources/layout.png)

Il se décompose en deux parties:
 - En haut:
    - À gauche: l'icône du site
    - À droite:
        - Le bouton de changement de langue
        - Le bouton d'aide
        - Le bouton de déconnexion
 - En bas: le corps du site.

### Fonctionnalités

 1. L'icône du site:
    - Dépend de la langue du site
    - Cliquable → renvoie à la racine du site
 2. Le bouton de changement de langue
    - En cliquant dessus, il affiche les langues disponibles
    - Cliquer sur un langue change la langue du site
 3. Le bouton d'aide
    - En survolant le bouton, affichage de l'aide contextuelle des éléments visibles sur la page
    - En cliquant dessus, il affiche les liens vers un tutorial et l'aide en ligne.
 4. Le bouton logout
    - En cliquant dessus, on se déloggue du site.

## Layout de navigation
### Description
Ce layout s'intégre dans le layout par défaut.
Il se compose de deux onglets, projet et gamme.
### Fonctionnalités
1. Le layout n'est accessible qu'une fois l'utilisateur identifié.
2. Les onglets sont cliquables
3. L'onglet projet donne accès au tableau de projet de l'équipe de l'utilisateur.
4. L'onglet gamme donne accès à l'espace de gestion des gammes.