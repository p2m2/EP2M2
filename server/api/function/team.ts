import pg from "pg";
import { compare } from "bcrypt";

export async function teamFromHash(inHash:string):Promise<string>{

    const client = new pg.Client();

    await client.connect();

    // Take user team
    const getTeamSQL = `SELECT e.enumlabel
                        FROM pg_type t, pg_enum e
                        WHERE t.typname = 'team'`;

    const listTeam = await client.query(getTeamSQL);
    if (listTeam.rows.length == 0) {
        throw new Error("No team");
    }
    // Verify team asked

    // thx https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
    const asyncFilter = async (arr: {enumlabel:string}[], predicate: (x: { enumlabel: string; }) => Promise<boolean>) => {
        const results = await Promise.all(arr.map(predicate));
    
        return arr.filter((_v, index) => results[index]);
    };

    const team = await asyncFilter(listTeam.rows, async (x: { enumlabel: string }) => {
        return await compare(x.enumlabel, inHash);
    });

    if (team.length != 1) {
        throw new Error("ask bad team");
    }

    return team[0].enumlabel;
}