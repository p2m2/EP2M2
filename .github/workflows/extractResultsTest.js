// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

// SPDX-License-Identifier: MIT
 
//  This file extracts the results of the tests from the file results.json

import fs from 'fs';
import path from 'path';
// import core from '@actions/core';
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

        fs.writeFileSync(path.join(process.env.GITHUB_OUTPUT), 
                         `\n totalTests=${totalTests}
                          \n passedTests=${passedTests}
                          \n failedTests=${failedTests}
                          \n pendingTests=${pendingTests}
                          \n todoTests=${todoTests}
                          \n successTests=${successTests}`);
        
        // Define the outputs for GitHub Actions
        // core.setOutput('totalTests', totalTests);
        // core.setOutput('passedTests', passedTests);
        // core.setOutput('failedTests', failedTests);
        // core.setOutput('pendingTests', pendingTests);
        // core.setOutput('todoTests', todoTests);
        // core.setOutput('successTests', successTests);

    } catch (parseError) {
        console.error('Analyse of json failed', parseError);
        process.exit(1); // out with an error
    }
});
