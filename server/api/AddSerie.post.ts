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
        .then((respQuery) => {
            if (respQuery.rows.length === 0) {
                throw new Error("Serie not create");
            }
            idSerie = respQuery.rows[0].id;
            console.log(`Serie ${idSerie} created`);
            const lPromises = [];
            // save each metabolite by daughter solution
            console.log("body.daughterGroup", body.daughterGroup);
            
            for (const idFile of Object.keys(body.daughterGroup)){  
                console.log("idFile", idFile);
                console.log("body.daughterGroup[idFile]", body.daughterGroup[idFile]);
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
        .then((metaRatio) => {
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
        .catch((err) => {
            console.error("Add serie fail : ", body.name, err);
            throw new Error("Add serie fail");
        })
        .finally(() => {
            // close the connection
            client.end();
        });
});
