<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: CC-BY-NC-4.0
-->

# Onglet Molecule

## Objectif
Cette onglet permet d'ajouter aux systèmes des molécules utilisées dans les 
analyses ciblées.
Ces informations seront entre autres au calcul des concentrations des gammes.

## Informations sur une molécule
Pour chaque molécule, il est possible d'avoir les informations suivantes:
- Identifiant ChEBI (obligatoire)
- Formule (obligatoire)
- Masse (obligatoire)
- Liste de noms (au moins un nom est obligatoire)
- Liste de molécules équivalentes (optionnel)

## Ajout d'une molécule
Pour ajouter une molécule, il faut :
1. Cliquer sur le bouton `Ajouter une molécule`.
2. Remplir le champs `Recherche` avec le nom ou la formule de la molécule.
3. Sélectionner la molécule dans la liste des résultats.
4. Si la molécule possède des molécules équivalentes présentes dans le système,
    1. Rechercher dans la liste des molécules équivalentes à l'aide du champs 
    `Recherche équivalence`.
    2. Sélectionner la molécule équivalente dans la liste des résultats.
    3. Répéter les étapes 4.1 et 4.2 pour chaque molécule équivalente.
5. Si vous souhaitez ajouter un nom.
    1. Cliquer sur le bouton `Ajouter un nom`.
    2. Remplir le champs `Nom`.
    3. Cliquer sur le bouton `Ajouter`.
    4. Répéter les étapes 5.1 à 5.3 pour chaque nom.
6. Cliquer sur le bouton `Ajouter`.

## Visualisation d'une molécule
Dans l'onglet `Molécule`, s'affiche la liste des molécules ajoutées au système.
Cette liste est composée des informations suivantes:
- Nom
- Identifiant ChEBI
- Formule
- Nombre de molécules équivalentes
- Actions possibles:
    - Visualiser
    - Modifier

Les supplémentaire informations d'une molécule peuvent être visualisées en 
cliquant sur le bouton `Visualiser`. On obtient alors les informations
suivantes:
- Identifiant ChEBI
- Formule
- Masse
- Liste de noms
- Liste de molécules équivalentes

## Modification d'une molécule
Les seules informations modifiables sont les noms de la molécule et les 
molécules équivalente.
Pour ajouter un nom et/ou une molécule équivalente, il faut:
1. Cliquer sur le bouton `Modifier` de la molécule à modifier.
2. Reprendre les étapes 4 et 5 de l'ajout d'une molécule.
3. Cliquer sur le bouton `Modifier`.

Pour la suppression d'un nom il faut:
1. Cliquer sur le bouton `Modifier` de la molécule à modifier.
2. Cliquer sur le bouton `Supprimer` du nom à supprimer.
3. Cliquer sur le bouton `Modifier`.

Pour la suppression d'une molécule équivalente il faut:
1. Cliquer sur le bouton `Modifier` de la molécule à modifier.
2. Cliquer sur le bouton `Supprimer` de la molécule équivalente à supprimer.
3. Cliquer sur le bouton `Modifier`.


