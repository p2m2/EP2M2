import pg from "pg";
import { compare } from "bcrypt";
import type { tProject } from "~/plugins/file";


export default defineEventHandler(async (event): Promise<{
    projects: tProject[] | [],
    count: number
}> => {
    const askProject = await readBody(event);

    const client = new pg.Client();

    await client.connect();

    // Take user team
    const getTeamSQL = `SELECT e.enumlabel
                        FROM pg_type t, pg_enum e
                        WHERE t.typname = 'team'`;

    const listTeam = await client.query(getTeamSQL);
    if (listTeam.rowCount == 1) {
        throw new Error("No team");
    }
    // Verify team asked

    // thx https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
    const asyncFilter = async (arr, predicate) => {
        const results = await Promise.all(arr.map(predicate));
    
        return arr.filter((_v, index) => results[index]);
    };

    const team = await asyncFilter(listTeam.rows, async (x: { enumlabel: string }) => {
        return await compare(x.enumlabel, askProject.team);
    });

    if (team.length != 1) {
        throw new Error("ask bad team");
    }

    // Get number projects for this team
    const countProjectsSql = `SELECT COUNT(id) as nb_project
                              FROM project
                              WHERE team = '${team[0].enumlabel}'`;
    const resultCount = await client.query(countProjectsSql);

    // No Projet
    if (resultCount.rowCount == 1 && resultCount.rows[0].nb_project == 0) {
        console.log("No project");
        return { projects: [], count: 0 };
    }

    // Nomber project by page
    const limit = 10;

    // Filter of page
    const orderBy = askProject.orderBy == "date" ? "project.date_create" :
        "project.id";
    const sort = askProject.sort == "DESC" ? "DESC" : "ASC";
    const offset = (askProject.page - 1) * limit;

    // Get Project about filter
    const getProjectsSQL = `SELECT project.id as p_id, project.name as p_name,
                                   project.date_create, file.name as f_name,
                                   file.f_type, file.f_size, file.id as f_id  
                            FROM project
                            FULL JOIN file on project.id = file.id_project
                            WHERE team = '${team[0].enumlabel}'
                            ORDER BY ${orderBy} ${sort}
                            LIMIT ${limit} OFFSET ${offset}`;

    const resultProject = await client.query(getProjectsSQL);

    await client.end();

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
                files: []
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

    return {
        projects: listProjects,
        count: Math.ceil(resultCount.rows[0].nb_project / limit)
    };
});