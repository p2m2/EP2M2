// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
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
            // create array area/concentration for each metabolite
            const metaConcentration: { [key: string]: [number, number][] } = {};
            // Group the area and concentration of each metabolite
            res.rows.forEach((row) => {
                if (!metaConcentration[row.id_mol]) {
                    metaConcentration[row.id_mol] = [];
                }
                metaConcentration[row.id_mol].push([row.area, row.concentration]);
            });      
           
            // caclulate regression of each metabolite in ax + b
            const metaRatio: { [key: string]: {a: number, b: number} } = {}
            for (const key in metaConcentration) {
                // calculate the linear regression               
                const { m, b } = linearRegression(metaConcentration[key]);

                // Case where we have one point in the calibration curve
                // The regression is not possible or defined constant curve
                // So we define a curve ax+b with 
                //  a = concentration/area and b = 0
                if (isNaN(m) || isNaN(b) || m === 0) {
                    metaRatio[key] = {
                        a: metaConcentration[key][0][1]/
                            metaConcentration[key][0][0], 
                        b: 0};
                }
                else{
                    metaRatio[key] = {a: m, b: b};
                }
            }
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
