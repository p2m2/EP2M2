// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provide function to add or update ratio of metabolite associate to project

import pg from "pg";
import { calculateRatioCalibCurve } from "./RegCalibCurve";

export async function updateRatio(id_project: string): Promise<void> {
    const client = new pg.Client();
    client.connect()
    .then(() => {
        // Get all calibration curve associate to the project
        return client.query(`
            SELECT id_calib_curves
            FROM proj_calib_curves
            WHERE id_project = '${id_project}'
        `)
    })
    .then((res: { rows: any[] }) => {
        // Delete all ratio associate to the project if no 
        // calibration curve
        if (res.rows.length === 0) {
            client.query(`
                DELETE FROM ratio
                WHERE id_project = '${id_project}'
            `);
            return [];
        }
        
        // structure the array of id_calib_curves
        return res.rows.map((value : {id_calib_curves:string}) => 
            value.id_calib_curves);
    })
    .then((arrayIdCalibCurve: string[]) => {        
        // Get the ratio of each metabolite of the calibration curve
        return calculateRatioCalibCurve(arrayIdCalibCurve);
    })
    .then((metaRatio: { [key: string]: {a: number, b: number} }) => {        
        // Update the ratio of each metabolite
        for (const key in metaRatio) {
            updateRatioMetabolite(key, id_project, metaRatio[key].a, metaRatio[key].b);
        }
    })
    .catch((err) => {
      console.error("connection error", err.stack);
    })
    .finally(() => {
        client.end();
        });

}

async function updateRatioMetabolite(id_mol: string, id_project: string, coef: number, ord: number): Promise<void> {
    const client = new pg.Client();
    client.connect()
    .then(() => {
        // Add or Update the ratio of the metabolite
        const query = {
            text: `INSERT INTO ratio (id_mol, id_project, coef, ord) VALUES ($1, $2, $3, $4)
            ON CONFLICT (id_mol, id_project) DO UPDATE SET coef = $3,  ord = $4`,
            values: [id_mol, id_project, coef, ord],
          };
        return client.query(query);
    })
    .catch((err) => {
        console.error("connection error", err.stack);
    })
    .finally(() => {
        client.end();
    });
}