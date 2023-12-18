import pg from "pg";
import {compare, hash} from "bcrypt";

export default defineEventHandler(async (event) : Promise<number|string> => {
    const login = await readBody(event);

    const client = new pg.Client();
    await client.connect();
    
    const getUserSQL = `SELECT id, name, lastname, hash, team
                        FROM users
                        WHERE email = '${login.email}'`;   
    const resultUser = await client.query(getUserSQL);
    
    if(resultUser.rowCount == 0){
        await client.end();
        return -1;
    }

    if(!await compare(login.password, resultUser.rows[0].hash)){
        await client.end();
        return -2;
    }
    
    return await hash(resultUser.rows[0].team, 10)
        .then((hash:string) => hash)
        .catch(() => -5)
        .finally(() => client.end());
});