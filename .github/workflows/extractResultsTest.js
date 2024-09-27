// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

// SPDX-License-Identifier: MIT
 
//  This file extracts the results of the tests from the file results.json

import fs from 'fs';

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
        console.log(`::set-output name=totalTests::${totalTests}`);
        console.log(`::set-output name=passedTests::${passedTests}`);
        console.log(`::set-output name=failedTests::${failedTests}`);
        console.log(`::set-output name=pendingTests::${pendingTests}`);
        console.log(`::set-output name=todoTests::${todoTests}`);
        console.log(`::set-output name=successTests::${successTests}`);

    } catch (parseError) {
        console.error('Analyse of json failed', parseError);
        process.exit(1); // out with an error
    }
});
