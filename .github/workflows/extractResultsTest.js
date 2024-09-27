// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

// SPDX-License-Identifier: MIT
 
//  This file extracts the results of the tests from the file results.json

import fs from 'fs';
// import path from 'path';
import {exec} from 'child_process';

// Path to the file containing the results of the tests
const filePath = './test/results/results.json';

fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Reading file failed:', err);
        process.exit(1); // out with an error
    }

    try {
        const results = JSON.parse(data);

        const totalTests = results.numTotalTests;
        const passedTests = results.numPassedTests;
        const failedTests = results.numFailedTests;
        const pendingTests = results.numPendingTests;
        const todoTests = results.numTodoTests; 
        const successTests = results.success;

        // Print the outputs for GitHub Actions
        exec(`echo "{totalTests}=${totalTests}" >> $GITHUB_OUT`);
        exec(`echo "{passedTests}=${passedTests}" >> $GITHUB_OUT`);
        exec(`echo "{failedTests}=${failedTests}" >> $GITHUB_OUT`);
        exec(`echo "{pendingTests}=${pendingTests}" >> $GITHUB_OUT`);
        exec(`echo "{todoTests}=${todoTests}" >> $GITHUB_OUT`);
        exec(`echo "{successTests}=${successTests}" >> $GITHUB_OUT`);

    } catch (parseError) {
        console.error('Analyse of json failed', parseError);
        process.exit(1); // out with an error
    }
});
