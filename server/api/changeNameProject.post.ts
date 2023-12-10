/*
 Change name of project
*/

import pg from "pg";

export default defineEventHandler((event) => {
    return readBody(event)
        .then((body) => {
            const client = new pg.Client();
            client.connect()
                .then(() => {
                    client.query(`UPDATE project
                                  SET name = '${body.name}'
                                  WHERE id = '${body.id}'`);
                })
                .then(() => client.end());
        });
});