// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const client = new pg.Client();
    return client.connect()
        .then(() => {
            console.log(body);
            
            const lPromises = [];
            for(const idSerie of body.series){               
                lPromises.push(
                    client.query(`
                        INSERT INTO proj_series(id_project, id_series)
                        VALUES ('${body.id_project}', '${idSerie}')`
                    )
                );
            }
            return Promise.allSettled(lPromises);
        })
        .catch((err: Error) => {
            throw err;
        })
        .finally(() => client.end());

});