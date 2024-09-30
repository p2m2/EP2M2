<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

# EP2M2 : Metabolomic Target Analyzes Manager.

## Tests
<!--GAMFC--></br>
[![result](./badges/tests-result.svg) ![total](./badges/tests-total.svg) ![passed](./badges/tests-passed.svg) ![failed](./badges/tests-failed.svg) ![todo](./badges/tests-todo.svg)](https://github.com/p2m2/EP2M2/actions/runs/11108995744) </br>[![Branches](./badges/coverage-branches.svg) ![Functions](./badges/coverage-functions.svg) ![Lines](./badges/coverage-lines.svg)![Statements](./badges/coverage-statements.svg) ![Coverage total](./badges/coverage-total.svg)](https://github.com/p2m2/EP2M2/actions/runs/11108995744)<!--GAMFC-END-->
## Features
- Extraction of formats files of the metabolomics data acquisition devices of the P2M2 platform
  - gcms
  - openlabcds
  - masslynx-txt
  - masslynx-xml
  - xcalibur
- Analyzes concatenation
- Custom post-process
- Data base of:
  - External compound
  - Devices
  - Associated calibration curves

## Installation

### Manual installation

```bash
npm i
```

### Running tests

```bash
docker volume prune
## database and API
docker compose --env-file .env.test -f compose.dev.yaml up -d

rpm run test
```

### Docker compose (Recommended)
_Requirement_ : Docker Engine
1. Download release archive
2. Extract archive
3. Go into folder
4. Create env file  
`echo "WEB_ADMIN=<adminitrator address>" > .env`  
`echo "WEB_PWD=<adminitrator 
password>" > .env`
5. Launch compose  
`docker compose up --detach`
6. Open browser to ip machine. You arrive onto login page of EP2M2. (else hold on 1 minute and refresh)
7. Remove env file  
`rm .env`

## User guide

## Contibution
[let's go](./doc/contribution.md)
## Report issue
- Directly on github
- Send e-mail at [team](mailto:p2m2-it@inrae.fr)
