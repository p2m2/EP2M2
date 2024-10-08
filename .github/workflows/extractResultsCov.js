
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
        // Parse the JSON file
        const results = JSON.parse(data);

        // Extract the coverage results
        const branchesCov = results.total.branches.pct;
        const functionsCov = results.total.functions.pct;
        const linesCov = results.total.lines.pct;
        const statementsCov = results.total.statements.pct;
        // Calculate the total coverage
        const totalCov = (branchesCov + functionsCov + linesCov + 
                          statementsCov) / 4;

        // Define the color of the coverage
        const branchesColorCov = color(branchesCov);
        const functionsColorCov = color(functionsCov);
        const linesColorCov = color(linesCov);
        const statementsColorCov = color(statementsCov);
        const totalColorCov = color(totalCov);


        // Sauvegarde l'état dans le fichier GitHub state
        fs.appendFileSync(
            path.join(process.env.GITHUB_OUTPUT),
            `\nbranchesCov=${branchesCov}\nfunctionsCov=${functionsCov}\nlinesCov=${linesCov}\nstatementsCov=${statementsCov}\ntotalCov=${totalCov}\nbranchesColorCov=${branchesColorCov}\nfunctionsColorCov=${functionsColorCov}\nlinesColorCov=${linesColorCov}\nstatementsColorCov=${statementsColorCov}\ntotalColorCov=${totalColorCov}\n`
        );

        // Définir l'output
        core.setOutput("branchesCov", branchesCov);
        core.setOutput("functionsCov", functionsCov);
        core.setOutput("linesCov", linesCov);
        core.setOutput("statementsCov", statementsCov);
        core.setOutput("totalCov", totalCov);
        core.setOutput("branchesColorCov", branchesColorCov);
        core.setOutput("functionsColorCov", functionsColorCov);
        core.setOutput("linesColorCov", linesColorCov);
        core.setOutput("statementsColorCov", statementsColorCov);
        core.setOutput("totalColorCov", totalColorCov);

    } catch (error) {
        console.error('Analyse of json failed', error);
        core.setFailed(`Action failed with error: ${error}`);
    }
});

/**
 * Define the color of the coverage based on the value
 * under 50% red, under 80% yellow, otherwise green
 * @param value number
 * @returns string
 */
function color(value) {
    // under 50% red, under 80% yellow, otherwise green
    if (value < 50) {
        return 'red';
    } else if (value < 80) {
        return 'yellow';
    } else {
        return 'green';
    }
}