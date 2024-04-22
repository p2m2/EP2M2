<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: CC-BY-NC-4.0
-->

# Spécification

## Objectif

La création d'un système d'information dédié à la génération de rapports des analyses métabolomiques ciblées.

## Contrainte 

Ce système d'information doit reposer à minimal sur le stack suivante :
- NUXT ([https://nuxt.com/](https://nuxt.com/))
- TypeScript ([https://www.typescriptlang.org/](https://www.typescriptlang.org/))

## Scénarios métier

### Extraction d'informations d'un fichier brut [001]

> Fichier brut:  
> On entends par là tous fichiers fournit par l'application d'une machine d'analyse

L'utilisateur créer un project dans lequel il téléverse l'ensemble des fichiers bruts de son analyse. Il demande une extraction des informations. Il obtient alors un fichier avec l'ensemble des informations.

#### Exigences
- [001_00] Un utilisateur doit être identifié.
  - [001_00a] Un utilisateur posséde un identifiant
  - [001_00b] Un utilisateur posséde un mot de passe
  - [001_00c] Un utilisateur fait partie d'une ou plusieurs équipes
- [001_08] Un utilisateur n'a accés qu'aux projets de la ou des équipes qu'il appartient
- [001_01]  Un utilisateur peut créer un projet.
- [001_02]  Un utilisateur peut téléverser dans un projet les fichiers de type:
  - [001_02a]  gcms
  - [001_02b]  openlabcds
  - [001_02c]  masslynx-txt
  - [001_02d]  masslynx-xml
  - [001_02e]  xcalibur
- [001_03] Les informations extraites des fichiers bruts sont:
  - [001_03a] sample
  - [001_03b] metabolite
  - [001_03c] retTime
  - [001_03d] area
  - [001_03e] height
  - [001_03f] injectedVolume
  - [001_03g] vial
  - [001_03h] acquisitionDate
  - [001_03i] exportDate
- [001_04]  Le fichier téléchargé est au format csv
  - [001_04a] Il contient une colonne par type d'inforamtion
- [001_05] Un utilisateur peut supprimer les fichiers d'un projet
- [001_06] Un utilisateur peut supprimer un projet
- [001_07] Un utilisateur peut visuliser un projet
- [001_09] Un projet
  - [001_09a] Un projet a un nom
  - [001_09b] Un projet a aucun, un ou plusieurs fichiers bruts.
  - [001_09c] Un projet a une date de création.
  - [001_09d] Un projet a une date d'archivage.
- [001_10] Un projet peut être archivé.


### Réalisation d'une gamme temporaire [002]
> Gamme  
> C'est l'ensemble des résultats d'analyses de plusieurs solutions sœurs pour une configuration machine.

> Solution mère  
> Solution d'un composé externe dont l'on connait la composition.

> Solution fille  
> Solution issue de la dilution d'une solution mère.

> Solutions sœurs  
> Deux ou plusieurs solutions filles issues de la même mère.

> Gamme temporaire  
> En opposition avec la gamme instantannée.
> C'est une gamme qui sera utilisée pour plusieurs projets.

> Gamme instantannée  
> Est une gamme utilisée pour un unique projet.

L'utilisateur crée une gamme. Il indique la solution mère employer. Il donne le paramêtre de la machine d'analyse. 
L'utilisateur fournit fichiers bruts des solution sœurs provenant d'une même configuration de machine. L'opérateur donne la concentration de chaque solution fille. À partir de cela est calculé le coefficient directeur de la droite de régression, passant par zéro, des points obtenues par l'aire en ordonnée et la concentration en abscisse des solutions filles.

#### Exigences
> Archive  
> Élément qu'on peut consulter mais pas modifier/supprimer/utiliser

- [002_00] Un utilisateur peut voir les métabolites.
- [002_01] Un utilisateur peut ajouter des métabolites.
  - [002_01a] Un métabolite est identifé par un URL.
- [002_02] Un métabolite peut être proche d'aucun, un ou plusieurs métabolites.
- [002_03] Un métabolite est visualisable.
- [002_04] Un utilisateur peut voir les solutions mères.
- [002_05] Un utilisateur peut ajouter une solutions mère.
- [002_06] Une solution mère 
  - [002_06a] Une solution mère a une référence
  - [002_06b] Une solution mère contient (permet d'analyser) un seul métabolite.
  - [002_06c] Une solution mère a une date d'ajout.
  - [002_06e] Une solution mère a une date d'archivage.
- [002_07] Une solution mère ne peut être supprimée que si elle n'est pas utilisée.
- [002_08] Une solution mère qui est utilisée peut être archivée.
- [002_09] Un utilisateur peut voir les configurations machine
- [002_10] Un utilisateur peut ajouter une configuration machine
- [002_11] Une configuration machine
  - [002_11a] Une configuration machine a un nom.
  - [002_11b] Une configuration machine a un nom de machine
  - [002_11c] Une configuration machine a un type de bloc primaire
  - [002_11d] Une configuration machine a un type de bloc secondaire
  - [002_11e] Une configuration machine a une date de création.
  - [002_11f] Une configuration machine a une date d'archivage.
- [002_12] Une configuration machine non utilisée peut être supprimée
- [002_13] Une configuration machine utilisée peut être archivée
- [002_14] Une configuration machine utilisée ne peut être modifiée
- [002_15] Une configuration machine non utilisée peut être modifiée 
- [002_16] Une gamme
  - [002_16a] Une gamme contient une solution mère.
  - [002_16b] Une gamme contient une configuration machine.
  - [002_16c] Une gamme contient une ou plusieurs solution sœurs.
  - [002_16d] Une gamme contient un coefficient directeur en μmol<sup>-1</sup>.
  - [002_16e] Une gamme a une date de création.
  - [002_16f] Une gamme a une date d'archivage.

### Extraction des informations des fichiers bruts avec correction à partir de gammes temporaires [003]

L'utilisateur créer un project dans lequel il téléverse l'ensemble des fichiers bruts de son analyse. L'opérateur sélectionne les gammes temporaires à utiliser. Il demande une extraction des informations. Il obtient alors un fichier avec l'ensemble des informations basique ainsi que celles corrigées (pour celles dont c'est possible).

- [003_01] Un projet
  - [003_01a] Un projet contient aucune, une ou plusieurs gammes temporaires.
  - [003_01b] Une gamme temporaire non archivée peut être ajouter à un projet.
  - [003_01c] Une gamme temporaire peut être supprimée d'un projet.
- [003_02] Le fichier contient en plus une colonne de l'aire corrigé (fitting area) à partir du coefficient directeur de la gamme temporaire associée au méthabolite.

### Extraction des informations des fichiers bruts avec correction à partir de gammes instantannée et un témoin [004]

L'utilisateur créer un project dans lequel il téléverse l'ensemble des fichiers bruts de son analyse. L'opérateur indique que les fichiers contiennent les gammes instantannées. L'opérateur indique que les fichiers contiennent le témoin. Il demande une extraction des informations. Il obtient alors un fichier avec l'ensemble des informations basique ainsi que celles corrigées (pour celles dont c'est possible).
