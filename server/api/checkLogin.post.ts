import pg from "pg";
import {compare} from "bcrypt";

export default defineEventHandler(async (event) => {
    const login = await readBody(event);
    console.log(1);
 
    const pool = new pg.Client();
    console.log(2);
    await pool.connect();
    console.log(21);
    
    const getUserSQL = `SELECT id, name, lastname, hash
                        FROM users
                        WHERE email = '${login.email}'`;
    console.log(getUserSQL);
    
    const resultUser = await pool.query(getUserSQL);
    console.log(3);
    
    if(resultUser.rowCount == 0){
        console.log(4);
        await pool.end();
        return null;
    }
    console.log(resultUser);
    
    console.log(5);
    if(!await compare(login.password, resultUser.rows[0].hash)){
        console.log(6);
        await pool.end();
        return null;
    }
    console.log(7);
    // Create token session
    const token = crypto.randomUUID();
    // thx https://stackoverflow.com/a/13693791
    const today = new Date(Date.now());
    const expire = new Date(today.getFullYear(), today.getMonth(),
        today.getDate()+7);
    
    console.log(8);
    
    const insTokenSql = `INSERT INTO verification_token 
                                (identifier, expire, token)
                         VALUES (${resultUser.rows[0].id}, 
                                 ${expire.toUTCString()}, ${token});`;
    
    const resultInsert = await pool(insTokenSql);
    console.log(9);                            
    if(!resultInsert){
        console.log(10);
        await pool.end();
        return null;
    }
    console.log(11);
    await pool.end();
    console.log(12);
    return {token:token, expire:expire, username: resultUser.rows[0].name,
        lastname:resultUser.rows[0].lastname};
});