import pg from "pg";

export default defineEventHandler(async (event) => {
    const token = await readBody(event);

    const pool = new pg.Pool();
    console.log(token);

    const findTokenSQL = `SELECT COUNT(*)
                          FROM verification_token 
                          WHERE token = ${token}`;
    
    const resultToken = await pool.query(findTokenSQL);

    await pool.end();
    
    if (resultToken){
        // it have to verify validity of token
        return true;
    }

    return false;
});