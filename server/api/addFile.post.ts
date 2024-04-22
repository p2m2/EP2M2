// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";
import {readFile, rm} from "fs/promises";
import {join} from "path";

function addFile(file: tFile, folder: string, client: any, id_project: string) {

    return readFile(join("/shareFile", folder, file.id), { encoding: "hex" })
        .then(buffer => {
            // thx: https://stackoverflow.com/a/14408194
            return client.query(`SELECT lo_from_bytea(0, '${"\\x" + buffer}') as oid`);
        })
        .then(async (respQuery) => {
            if (respQuery.rows.length === 0) {
                throw new Error("OID not create");
            }
            const oid = respQuery.rows[0].oid;
            return client.query(`INSERT INTO file(name, date_create, f_type,
                                                  f_size, content,id_project)
                                 VALUES ('${file.name}', NOW(),
                                         '${file.type}', '${file.size}',
                                         '${oid}', '${id_project}')`);
        })
        .catch((err) => {
            console.error("Add file fail : ", file.name, err);
            throw new Error("Add file fail");
        });
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const client = new pg.Client();
    return client.connect()
        .then(() => {
            return Promise.all(body.files.map((file: tFile) => 
                addFile(file, body.folder, client, body.id_project)));
        })
        .then(() => rm(join("/shareFile", body.folder),
            { recursive: true, force: true }))
        .catch((err: Error) => {
            console.error(err);
            throw err;
        })
        .finally(() => client.end());

});