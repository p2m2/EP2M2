<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: CC-BY-NC-4.0
-->

# Contribution

Avant toutes contributions à ce projet merci de bien vouloir lire:
- [Les spécifications](./spec_fr.md)
- [La documentation technique](./doc_fr.md)
- [Architecture du site web](./archi_web_fr.md)


# Environnement de développement
L'environnement de développement est basé de deux conteneurs docker. Ils fournissent une base de données et une API REST.

## Prérequis
- docker
- docker-compose
- npm

## Installation

1. Cloner le dépôt
2. Lancez les conteneurs docker

```bash
docker compose --env-file=.env.dev -f compose.dev.yaml up -d
```

3. installer les dépendances

```bash
npm i
```

## Lancer l'application

1. Avoir fait l'installation
2. Lancer l'application
```bash
npm run dev
```
3. Ouvrir un navigateur à l'adresse [http://localhost:3000](http://localhost:3000)

## lancer les tests
1. Avoir fait l'installation
2. Lancer les tests
```bash
npm run test
```

## Tagger les nouveaux fichiers avec une licence

### Fichier de code
```bash
docker run --rm --volume $(pwd):/data fsfe/reuse annotate --copyright INRAE --copyright-prefix string-symbol --contributor "prénom_nom <e-mail>" --license MIT --fallback-dot-license --merge-copyrights chemin_du_fichier
```

### Fichier de documentation
```bash
docker run --rm --volume $(pwd):/data fsfe/reuse annotate --copyright INRAE --copyright-prefix string-symbol --contributor "prénom_nom <e-mail>" --license CC-BY-NC-4.0 --fallback-dot-license --merge-copyrights chemin_du_fichier
```

### Un logo
```bash
docker run --rm --volume $(pwd):/data fsfe/reuse annotate --copyright INRAE --copyright-prefix string-symbol --contributor "prénom_nom <e-mail>" --license CC-BY-NC-ND-4.0 --fallback-dot-license --merge-copyrights chemin_du_fichier
```

## Vérifier la conformité de la réutilisation
```bash
docker run --rm --volume $(pwd):/data fsfe/reuse --include-submodules lint
```