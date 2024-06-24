// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This API is used to add a new serie to the database.

import pg from "pg";
import { calculateRatioSerie } from "./function/RegSerie";


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    let idSerie: string;
    const client = new pg.Client();
    return client.connect()
        .then(() => {
            return client.query(`
                INSERT INTO series(name, date_create, id_machine)
                VALUES ('${body.nameSerie}', NOW(), -1)
                RETURNING id`); // -1 is the default value for id_machine
        })
        .then((respQuery:{rows:any[]}) => {
            if (respQuery.rows.length === 0) {
                throw new Error("Serie not create");
            }
            idSerie = respQuery.rows[0].id;
            const lPromises = [];
            // save each metabolite by daughter solution           
            for (const idFile of Object.keys(body.daughterGroup)){  
                for(const metabo of body.daughterGroup[idFile]){
                    lPromises.push(  
                        client.query(`
                            INSERT INTO daughter(
                                id_series, id_file, id_mol, area, expected) 
                            VALUES (
                            '${idSerie}',
                            '${idFile}',
                            '${metabo.nameMeta}',
                            '${metabo.area}',
                            '${metabo.expectedArea}')`
                        )
                    );
                }
            }
            return Promise.allSettled(lPromises);
        })
        .then(() => {
            // calculate the ratio for each metabolite
            return calculateRatioSerie(idSerie);
        })
        .then((metaRatio:{[key:string]:number}) => {
            const lPromises = [];
            // save the ratio in the database            
            for(const key in metaRatio){
                lPromises.push(
                    client.query(`
                        INSERT INTO ratio(id_series, id_mol, ratio) 
                        VALUES ('${idSerie}', '${key}', '${metaRatio[key]}')`
                    )
                );
            }
            return Promise.allSettled(lPromises);
        })
        .catch((err:Error) => {
            return new Error("Add serie fail", err);
        })
        .finally(() => {
            // close the connection
            client.end();
        });
});
