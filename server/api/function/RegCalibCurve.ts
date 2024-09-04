// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provide function to calclate the ratio to applied to the area of 
// each the metabolite of one calibration curve.

import pg from "pg";
import { linearRegression } from "simple-statistics";

export async function calculateRatioCalibCurve(arrayIdCalibCurve: string[]): Promise<number | { [key: string]: number }> {

    const client = new pg.Client();
    const idCalibCurve = arrayIdCalibCurve.join("','");
    return client.connect()
        .then(() => {
            // Get the area and concentration of the metabolite of the calibration curve
            return client.query(`
                SELECT id_mol,area, concentration
                FROM daughter
                WHERE id_calib_curves IN ('${idCalibCurve}')
            `)
        })
        .then((res: { rows: any[] }) => {
            console.log("meth", res.rows);
            
            // create array area/concentration for each metabolite
            const metaConcentration: { [key: string]: [number, number][] } = {};
            // Group the area and concentration of each metabolite
            res.rows.forEach((row) => {
                if (!metaConcentration[row.id_mol]) {
                    metaConcentration[row.id_mol] = [];
                }
                metaConcentration[row.id_mol].push([row.area, row.concentration]);
            });
            console.log("metaConcentration0", metaConcentration);
            
            // add the first element to 0,0 if we have one point for the 
            //   metabolite
            for (const key in metaConcentration) {
                // We check after the deletion of the double point
                if (deleteDoublePoint(metaConcentration[key]).length === 1) {
                    metaConcentration[key].push([0, 0]);
                }
            }
            console.log("metaConcentration", metaConcentration);
            
            // caclulate regression of each metabolite in ax + b
            const metaRatio: { [key: string]: {a: number, b: number} } = {}
            for (const key in metaConcentration) {
                // calculate the linear regression
                console.log(key, metaConcentration[key]);
                
                const { m, b } = linearRegression(metaConcentration[key]);
                metaRatio[key] = {a: m, b: b};
            }
            console.log("metaRatio", metaRatio);
            return metaRatio
        })
        .catch(() => {
            return 1;
        })
        .finally(() => {
            // close the connection
            client.end();
        });
}

/**
 * Delete double point in the array
 * @param array
 * @returns array without double point
 */
function deleteDoublePoint(array: [number, number][]): [number, number][] {
    // Track Seen Strings: A Set is used to keep track of the 
    // string representations of sub-arrays that have already been
    // encountered.
    const seen = new Set();
    return array.filter(subArray => {
        // Convert Sub-Arrays to Strings:
        const stringified = JSON.stringify(subArray);
        // Check if the stringified sub-array has already been 
        // encountered:
        if (seen.has(stringified)) {
            // If it has been encountered, return false to remove
            return false;
        } else {
            // keep the stringified sub-array in the set:
            seen.add(stringified);
            // keep the sub-array in the filtered array:
            return true;
        }
    });
}
