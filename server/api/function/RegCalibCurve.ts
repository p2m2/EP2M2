// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provide function to calclate the ratio to applied to the area of 
// each the metabolite of one calibration curve.

import pg from "pg";
import { linearRegression } from "simple-statistics";

export async function calculateRatioCalibCurve(idCalibCurve:string):Promise<number | {[key:string]:number}>{

    const client = new pg.Client();

    return client.connect()
        .then(() => {
            // Get the area and concentration of the metabolite of the calibration curve
            return client.query(`
                SELECT id_mol,area, concentration FROM daughter
                WHERE id_calib_curves='${idCalibCurve}'
            `)
        })
        .then((res:{rows:any[]}) => {
            // create array area/concentration for each metabolite
            const metaConcentration: {[key:string]:[number,number][]} = {}
            
            for(const row of res.rows){
                // if the metabolite is not in the array, create it
                if(metaConcentration[row.id_mol]===undefined){
                    // initialize first element to position 0,0
                    // if no metabolits, machine return noting
                    metaConcentration[row.id_mol] = [[0,0]]
                }
                metaConcentration[row.id_mol].push([row.area,row.concentration]);
            }
            
            // caclulate director coefficient of each metabolite
            const metaRatio: {[key:string]:number}= {}
            for(const key in metaConcentration){
                // calculate the linear regression
                const {m} = linearRegression(metaConcentration[key]);
                metaRatio[key] = m;
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