// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";

export default defineEventHandler(async (event) => {
    const token = await readBody(event);
    
    const client = new pg.Client();

    await client.connect();

    const findTokenSQL = `SELECT COUNT(*)
                          FROM verification_token 
                          WHERE token = '${token}'`;
    
    const resultToken = await client.query(findTokenSQL);

    await client.end();

    if (resultToken.rowCount==1 && resultToken.rows[0].count == 1){
        // it have to verify validity of token
        return true;
    }

    return false;
});