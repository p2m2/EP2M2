import pg from "pg";
import {compare} from "bcrypt";

export default defineEventHandler(async (event) : Promise<number> => {
    const login = await readBody(event);

    const client = new pg.Client();
    await client.connect();
    
    const getUserSQL = `SELECT id, name, lastname, hash
                        FROM users
                        WHERE email = '${login.email}'`;   
    const resultUser = await client.query(getUserSQL);
    
    if(resultUser.rowCount == 0){
        await client.end();
        return -1;
    }
    console.log(resultUser);
    
    console.log(5);
    if(!await compare(login.password, resultUser.rows[0].hash)){
        console.log(6);
        await client.end();
        return -2;
    }
    console.log(7);
    


    return resultUser.rows[0].id;
});