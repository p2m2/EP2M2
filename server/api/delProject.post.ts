/*
 Delete a project
*/

import pg from "pg";

export default defineEventHandler((event) => {
    return readBody(event)
        .then(idProject => {
            const client = new pg.Client();
            return client.connect()
                // thx https://stackoverflow.com/a/11691651
                .then(() => client.query(`DELETE FROM file
                                          WHERE id_project ='${idProject}'`))
                .then(() => client.query(`DELETE FROM project
                                          WHERE id ='${idProject}'`));
        });
});