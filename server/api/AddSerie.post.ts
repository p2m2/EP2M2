// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This API is used to add a new serie to the database.

import pg from "pg";


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
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
            // save each metabolite by daughter solution
            return Promise.all(Object.keys(body.daughterGroup).map(
                (idFile: string) => {     
                    //     
                    for(const metabo of body.daughterGroup[idFile]){
                        client.query(`
                            INSERT INTO daughter(
                                id_series, id_file, id_mol, area, expected) 
                            VALUES (
                                '${respQuery.rows[0].id}',
                                '${idFile}',
                                '${metabo.nameMeta}',
                                '${metabo.area}',
                                '${metabo.expectedArea}')`
                        );
                    }
                }
            ));
        })
        .catch((err) => {
            console.error("Add serie fail : ", body.name, err);
            throw new Error("Add serie fail");
        });
});
