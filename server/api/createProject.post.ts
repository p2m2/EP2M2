import pg from "pg";
import type { MultiPartData } from "h3";
import { rm } from "fs/promises";
import { join } from "path";
import { teamFromHash } from "./function/team";

function getFromMultipartFormData(item: MultiPartData[], field: string) {
    return item.filter(x => x.name == field)[0].data.toString();
}

export default defineEventHandler((event) => {
    return readMultipartFormData(event)
        .then(async (body) => {
            if (body == undefined || body.length != 3) {
                throw new Error("bad request");
            }
            const folder = getFromMultipartFormData(body, "folder");
            const team = await teamFromHash(getFromMultipartFormData(body,
                "team"));
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

                    return $fetch("/api/addFile",{
                        method:"POST",
                        body: {
                            files: project.files,
                            folder: folder,
                            id_project: respQuery.rows[0].id
                        }
                    });

                })
                .then(() => rm(join("/shareFile", folder),
                    { recursive: true, force: true }))
                .catch((err: Error) => {
                    console.error(err);
                    throw err;
                })
                .finally(() => client.end());
        })
        .catch((err:Error) => {
            console.error(err);
            throw err;
        });
});