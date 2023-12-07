import pg from "pg";
import type { MultiPartData } from "h3";
import { readFile, rm } from "fs/promises";
import { join } from "path";

function addFile(file: tFile, folder: string, client: any, id_project: string) {

    return readFile(join("/shareFile", folder, file.id),{encoding:"hex"})
        .then(buffer => {
            // thx: https://stackoverflow.com/a/14408194
            return client.query(`SELECT lo_from_bytea(0, '${"\\x" + buffer}') as oid`);
        })
        .then(async(respQuery) => {
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

function getFromMultipartFormData(item: MultiPartData[], field: string) {
    return item.filter(x => x.name == field)[0].data.toString();
}

export default defineEventHandler((event) => {
    return readMultipartFormData(event)
        .then((body) => {
            if (body == undefined || body.length != 3) {
                throw new Error("bad request");
            }
            const folder = getFromMultipartFormData(body, "folder");
            const team = getFromMultipartFormData(body, "team");
            const project = JSON.parse(getFromMultipartFormData(body,
                "project"));

            const addProjectSql = `INSERT INTO 
                                    project (name, date_create, team)
                                   VALUES ('${project.name}', 
                                           NOW(),
                                           '${team}')`;


            const client = new pg.Client();
            return client.connect()
                .then(() => {
                    return client.query(addProjectSql);
                })
                .then(() => {
                    return client.query(`SELECT id
                                         FROM project
                                         WHERE name = '${project.name}'`);
                })
                .then((respQuery:{rows:{id:string}[]}) => {
                    if (respQuery.rows.length === 0) {
                        throw new Error("project not create");
                    }
                    return Promise.all(project.files.map((x: tFile) => addFile(x,
                        folder, client, respQuery.rows[0].id)));

                })
                .then(() => rm(join("/shareFile", folder),
                    { recursive: true, force: true }))
                .then(() => 0)
                .catch((err: Error) => {
                    console.error(err);
                    throw err;
                });
        })
        .then(() => 0)
        .catch((err:Error) => {
            console.error(err);
            return 1;
        } );
});