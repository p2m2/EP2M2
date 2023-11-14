import pg from "pg";

export default defineEventHandler(async (event) : Promise<number> => {

    const token = await readBody(event);

    const client = new pg.Client();

    await client.connect();
   
    console.log(8);
    
    const insTokenSql = `INSERT INTO verification_token 
                                (identifier, expires, token)
                        VALUES ('${token.id}', 
                                '${token.expire}', '${token.token}');`;
    
    const resultInsert = await client.query(insTokenSql);
    console.log(9);           
    console.log(resultInsert);
                    
    if(!resultInsert){
        console.log(10);
        await client.end();
        return -1;
    }


    console.log(11);
    await client.end();
    console.log(12);

    return 1;
});