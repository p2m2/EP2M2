/*
 Delete list of files
*/

import pg from "pg";

export default defineEventHandler((event) => {
    return readBody(event)
        .then(delListId => {
            const client = new pg.Client();
            return client.connect()
                // We don't need this part because the lo_unlink is in DELETE
                // .then(() => client.query(`SELECT lo_unlink(content)
                //                           FROM file
                //                           WHERE id IN 
                //                           (${delListId.join(",")})`))
                // thx https://stackoverflow.com/a/11691651
                .then(() => client.query(`DELETE FROM file
                                          WHERE id IN 
                                          (${delListId.join(",")})`))
                .finally(() => client.end());
        });
});