
// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

 
//  This file extracts the results of the tests from the file results.json

import fs from 'fs';
import path from 'path';
import * as core from '@actions/core';

// Path to the file containing the results of the tests
const filePath = './test/results/results.json';

fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Reading file failed:', err);
        core.setFailed(`Reading file failed with error: ${err}`);
    }

    try {
        const results = JSON.parse(data);

        const totalTests = results.numTotalTests;
        const passedTests = results.numPassedTests;
        const failedTests = results.numFailedTests;
        const pendingTests = results.numPendingTests;
        const todoTests = results.numTodoTests; 
        const successTests = results.success;

        // Sauvegarde l'état dans le fichier GitHub state
        fs.appendFileSync(
            path.join(process.env.GITHUB_OUTPUT),
            `\ntotalTest=${totalTests}\npassedTests=${passedTests}\nfailedTests=${failedTests}\npendingTests=${pendingTests}\ntodoTests=${todoTests}\nsuccessTests=${successTests}\n`
        );

        // Définir l'output
        core.setOutput("todoTests", todoTests);
        core.setOutput("successTests", successTests);
        core.setOutput("totalTests", totalTests);
        core.setOutput("passedTests", passedTests);
        core.setOutput("failedTests", failedTests);
        core.setOutput("pendingTests", pendingTests);


    } catch (error) {
        console.error('Analyse of json failed', error);
        core.setFailed(`Action failed with error: ${error}`);
    }
});
