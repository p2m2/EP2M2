// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";

export default defineEventHandler((event) => {
    return readBody(event)
        .then((body) => {
           
            const client = new pg.Client();
            return client.connect()

                .then(() => client.query(`DELETE FROM proj_series
                                          WHERE id_series IN 
                                          (${body.series.join(",")})
                                          AND id_project = ${body.id_project}`))
                .finally(() => client.end());
        });
});