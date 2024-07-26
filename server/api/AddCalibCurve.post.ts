// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This API is used to add a new calibration curve to the database.

import pg from "pg";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    let idCalibCurve: string;
    const client = new pg.Client();
    return client.connect()
        .then(() => {
            return client.query(`
                INSERT INTO calib_curves(name, date_create, id_machine)
                VALUES ('${body.nameCalibCurve}', NOW(), -1)
                RETURNING id`); // -1 is the default value for id_machine
        })
        .then((respQuery:{rows:any[]}) => {
            if (respQuery.rows.length === 0) {
                throw new Error("CalibCurve not create");
            }
            idCalibCurve = respQuery.rows[0].id;
            const lPromises = [];
            // save each metabolite by daughter solution           
            for (const idFile of Object.keys(body.daughterGroup)){  
                for(const metabo of body.daughterGroup[idFile]){
                    lPromises.push(  
                        client.query(`
                            INSERT INTO daughter(
                                id_calib_curves, id_file, id_mol, area, concentration) 
                            VALUES (
                            '${idCalibCurve}',
                            '${idFile}',
                            '${metabo.nameMeta}',
                            '${metabo.area}',
                            '${metabo.concentration}')`
                        )
                    );
                }
            }
            return Promise.allSettled(lPromises);
        })
        .catch((err:Error) => {
            return new Error("Add calibration curve fail", err);
        })
        .finally(() => {
            // close the connection
            client.end();
        });
});
