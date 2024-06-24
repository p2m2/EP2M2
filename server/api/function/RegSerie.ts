// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provide function to calclate the ratio to applied to the area of 
// each the metabolite of one serie.

import pg from "pg";
import { linearRegression } from "simple-statistics";

export async function calculateRatioSerie(idSerie:string):Promise<number | {[key:string]:number}>{

    const client = new pg.Client();

    return client.connect()
        .then(() => {
            // Get the area and expected area of the metabolite of the serie
            return client.query(`
                SELECT id_mol,area, expected FROM daughter
                WHERE id_series='${idSerie}'
            `)
        })
        .then((res:{rows:any[]}) => {
            // create array area/expected for each metabolite
            const metaAreaExpected: {[key:string]:[number,number][]} = {}
            
            for(const row of res.rows){
                // if the metabolite is not in the array, create it
                if(metaAreaExpected[row.id_mol]===undefined){
                    // initialize first element to position 0,0
                    // if no metabolits, machine return noting
                    metaAreaExpected[row.id_mol] = [[0,0]]
                }
                metaAreaExpected[row.id_mol].push([row.area,row.expected]);
            }
            
            // caclulate director coefficient of each metabolite
            const metaRatio: {[key:string]:number}= {}
            for(const key in metaAreaExpected){
                // calculate the linear regression
                const {m} = linearRegression(metaAreaExpected[key]);
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