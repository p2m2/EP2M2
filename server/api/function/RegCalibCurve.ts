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
            // create array area/concentration for each metabolite
            const metaConcentration: { [key: string]: [number, number][] } = {};
            // Group the area and concentration of each metabolite
            res.rows.map((row) => {metaConcentration[row.id_mol].push([row.area, row.concentration])});
            // add the first element to 0,0 if we have one point for the 
            //   metabolite
            for (const key in metaConcentration) {
                if (metaConcentration[key].length === 1) {
                    metaConcentration[key].push([0, 0]);
                }
            }

            // caclulate regression of each metabolite in ax + b
            const metaRatio: { [key: string]: {a: number, b: number} } = {}
            for (const key in metaConcentration) {
                // calculate the linear regression
                const { m, b } = linearRegression(metaConcentration[key]);
                metaRatio[key] = {a: m, b: b};
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