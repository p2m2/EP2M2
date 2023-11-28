import pg from "pg";
import type { tProject } from "~/types/file";

export default defineEventHandler(async (event):Promise<tProject[]> => {
    const askProject = await readBody(event);
    console.log(askProject);

    const client = new pg.Client();

    await client.connect();

    // Take user team
    const getTeamSQL = `SELECT e.enumlabel
                        FROM pg_type t, pg_enum e
                        WHERE t.typname = 'team'`;
    
    const listTeam = await client.query(getTeamSQL);
    if (listTeam.rowCount == 1 && listTeam.rows[0].count == 0){
        throw new Error("No team");
    }
    console.log(listTeam);
        
    // Verify team asked
    const team = listTeam.rows.filter((x:{enumlabel:string}) => 
        x.enumlabel == askProject.team);
    if(team.length != 1){
        throw new Error("ask bad team");
    }

    // Nomber project by page
    const limit = 10;

    // Filter of page
    const orderBy = askProject.orderBy == "date" ? "project.createDate" :
        "project.id";
    const sort = askProject.sort == "DESC" ? "DESC": "ASC"; 
    const offset = (askProject.page - 1) * limit;

    // Get Project about filter
    const getProjectsSQL = `SELECT * 
                            FROM project
                            FULL JOIN file on project.id = file.id_project
                            WHERE team = '${askProject.team}'
                            ORDER BY ${orderBy} ${sort}
                            LIMIT ${limit} OFFSET ${offset}`;


    const resultProject = await client.query(getProjectsSQL);

    await client.end();

    console.log(resultProject);

    // No Projet
    if (resultProject.rowCount == 1 && resultProject.rows[0].count == 0) {
        throw new Error("No project");
    }

    // Create list of project
    const listProjects:tProject[] = []; 
    let currentId:string = "";
    for (const row of resultProject.rows){
        // Add new project
        if(currentId != row.project.id){
            listProjects.push({
                id:row.project.id,
                name:row.project.name,
                createDate:row.project.date_create,
                nbFile:0,
                files:[]
            });
            currentId = row.project.id;
        }

        // Add files of project
        if(row.file.id == row.project.id){
            listProjects.at(-1)?.files?.push({
                id: row.file.id,
                name: row.file.name,
                type: row.file.kind,
                size: row.file.size
            });
        }

    }
    return listProjects;
});