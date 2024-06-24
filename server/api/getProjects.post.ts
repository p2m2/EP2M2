// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";
import type { tProject } from "~/plugins/file";
import { teamFromHash } from "./function/team";

export default defineEventHandler(async (event): Promise<{
    projects: tProject[] | [],
    count: number
}> => {
    const askProject = await readBody(event);

    const client = new pg.Client();

    await client.connect();

    // Get team name
    const team = await teamFromHash(askProject.team);
    // Get number projects for this team
    const countProjectsSql = `SELECT COUNT(id) as nb_project
                              FROM project
                              WHERE team = '${team}'`;
    const resultCount = await client.query(countProjectsSql);

    // No Projet
    if (resultCount.rowCount == 1 && resultCount.rows[0].nb_project == 0) {
        console.log("No project");
        return { projects: [], count: 0 };
    }

    // Nomber project by page
    const limit = 5;
    
    // Filter of page
    const orderBy = askProject.orderBy == "createDate" ? "project.date_create" :
        "project.id";
    
    const sort = askProject.sort == "desc" ? "DESC" : "ASC";
    
    const offset = (askProject.page - 1) * limit;

    // Get Project about filter
    const getProjectsSQL = `
        SELECT project.id as p_id, project.name as p_name, project.date_create,
               view_proj_file.name as f_name, view_proj_file.f_type,
               view_proj_file.f_size, view_proj_file.id as f_id  
        FROM project
        FULL JOIN view_proj_file on view_proj_file.id_project = project.id
        WHERE project.id IN (
            SELECT id
            FROM project
            WHERE team = '${team}'
            ORDER BY ${orderBy} ${sort}
            LIMIT ${limit} OFFSET ${offset})
        ORDER BY ${orderBy} ${sort}`;
    
    const resultProject = await client.query(getProjectsSQL);

    // Create list of project
    const listProjects: tProject[] = [];
    let currentId: string = "";
    for (const row of resultProject.rows) {

        // Add new project
        if (currentId != row.p_id) {
            listProjects.push({
                id: row.p_id,
                name: row.p_name,
                createDate: row.date_create,
                nbFile: resultProject.rows.filter((x: {
                    p_id: string,
                    f_id: string
                }) => (x.p_id == row.p_id) && x.f_id).length,
                files: [],
                series: []
            });
            currentId = row.p_id;
        }

        // Add files of project
        if (row.f_id && listProjects.at(-1)) {
            listProjects.at(-1)?.files.push({
                id: row.f_id,
                name: row.f_name,
                type: row.f_type,
                size: row.f_size
            });
        }

    }

    // Add associated series of project
    for (const project of listProjects) {
        const getSeriesSQL = `SELECT id_series
                              FROM proj_series
                              WHERE id_project = '${project.id}'`;

        const resultSeries = await client.query(getSeriesSQL);

        for (const row of resultSeries.rows) {
            project.series.push(row.id_series);
        }
    }

    await client.end();

    return {
        projects: listProjects,
        count: Math.ceil(resultCount.rows[0].nb_project / limit)
    };
});