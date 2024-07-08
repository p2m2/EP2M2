// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";
import {readFile, rm} from "fs/promises";
import {join} from "path";

const runtimeConfig = useRuntimeConfig()

async function addFile(file: tFile, folder: string, client: any, id_project: string) {

    let oid: string;
    return readFile(join(runtimeConfig.pathShare, folder, file.id),
                    {encoding: "hex" })
        .then(buffer => {
            // thx: https://stackoverflow.com/a/14408194
            return client.query(`SELECT lo_from_bytea(0, '${"\\x" + buffer}') as oid`);
        })
        .then(async (respQuery) => {
            if (respQuery.rows.length === 0) {
                throw new Error("OID not create");
            }
            oid = respQuery.rows[0].oid;
            return client.query(`INSERT INTO file(name, date_create, f_type,
                                                  f_size, content)
                                 VALUES ('${file.name}', NOW(),
                                         '${file.type}', '${file.size}',
                                         '${oid}')`);
        })
        .then(() => {
            // get id of the new file
            return client.query(`
                SELECT id FROM file 
                WHERE name = '${file.name}'
                AND content = '${oid}'`);
        })
        .then((respQuery) => {
            if (respQuery.rows.length === 0) {
                throw new Error("File not create");
            }
            // Break the promise chain when we haven't project
            if (id_project === "NULL") {
                return respQuery.rows[0].id;
            }
            // associate the file with the project
            return client.query(`
                INSERT INTO proj_file(id_project, id_file)
                VALUES ('${id_project}', '${respQuery.rows[0].id}')`);
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
        .then((resp:number[] | []) => {          
            rm(join(runtimeConfig.pathShare, body.folder),{
                 recursive: true, force: true 
                });
            if (body.id_project === "NULL") return resp[0];
            })
        .catch((err: Error) => {
            console.error(err);
            throw err;
        })
        .finally(() => client.end());

});