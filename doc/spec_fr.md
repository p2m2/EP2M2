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
    - [001_00ca] Un utilisateur n'a accés qu'aux projets de la ou des équipes qu'il appartient
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
