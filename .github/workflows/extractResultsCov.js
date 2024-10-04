
// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

 
//  This file extracts the results of the coverage from the file 
//  coverage-summary.json

import fs from 'fs';
import path from 'path';
import * as core from '@actions/core';

// Path to the file containing the results of the tests
const filePath = './coverage/coverage-summary.json';

fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Reading file failed:', err);
        core.setFailed(`Reading file failed with error: ${err}`);
    }

    try {
        const results = JSON.parse(data);

        const branchesCov = results.total.branches.pct;
        const functionsCov = results.total.functions.pct;
        const linesCov = results.total.lines.pct;
        const statementsCov = results.total.statements.pct;
        const totalCov = (branchesCov + functionsCov + linesCov + 
                          statementsCov) / 4;


        // Sauvegarde l'état dans le fichier GitHub state
        fs.appendFileSync(
            path.join(process.env.GITHUB_OUTPUT),
            `\nbranchesCov=${branchesCov}\nfunctionsCov=${functionsCov}\nlinesCov=${linesCov}\nstatementsCov=${statementsCov}\ntotalCov=${totalCov}\n`
        );

        // Définir l'output
        core.setOutput("branchesCov", branchesCov);
        core.setOutput("functionsCov", functionsCov);
        core.setOutput("linesCov", linesCov);
        core.setOutput("statementsCov", statementsCov);
        core.setOutput("totalCov", totalCov);

    } catch (error) {
        console.error('Analyse of json failed', error);
        core.setFailed(`Action failed with error: ${error}`);
    }
});
