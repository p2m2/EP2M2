import pg from "pg";
import type { MultiPartData } from "h3";
import { readFile } from "fs/promises";
import { join } from "path";

function addFile(file: tFile, folder: string, client: any, id_project: string) {

    return readFile(join("/shareFile", folder, file.id))
        .then(buffer => {
            return client.query(`SELECT lo_from_bytea(0, '${buffer.toString("hex")}') as oid`);
        })
        .then((respQuery) => {
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
        .catch((err) => console.error("Add file fail : ", file.name, err)
        );
}

function getFromMultipartFormData(item: MultiPartData[], field: string) {
    return item.filter(x => x.name == field)[0].data.toString();
}

export default defineEventHandler(async (event) => {
    readMultipartFormData(event)
        .then(async (body) => {
            if (!body && body.length != 3) {
                return 1;
            }
            const folder = getFromMultipartFormData(body, "folder");
            const team = getFromMultipartFormData(body, "team");
            const project = JSON.parse(getFromMultipartFormData(body,
                "project"));

            console.log(project);

            const addProjectSql = `INSERT INTO 
                                    project (name, date_create, team)
                                   VALUES ('${project.name}', 
                                           NOW(),
                                           '${team}')`;


            const client = new pg.Client();
            client.connect()
                .then(() => {
                    return client.query(addProjectSql);
                })
                .then(() => {
                    return client.query(`SELECT id
                                         FROM project
                                         WHERE name = '${project.name}'`);
                })
                .then((respQuery) => {
                    if (respQuery.rows.length === 0) {
                        throw new Error("project not create");
                    }
                    return Promise.all(project.files.map((x:tFile) => addFile(x,
                        folder, client, respQuery.rows[0].id)));

                })
                .finally(() => client.end());
        });
});