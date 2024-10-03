// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// this file is used to update the concentration of the daughters
// of a calibration curve
import pg from "pg";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const client = new pg.Client();
    return client.connect()
        .then(() => {
            const lQueryPromises = [];
            // for each daughter solution
            for(const idFile in body.daughters){
                // for each metabolite of the daughter solution
                for(const daughter of body.daughters[idFile]){
                   // insert or update concentration
                   lQueryPromises.push(client.query(`
                        INSERT INTO daughter 
                           (id_file, id_mol, id_calib_curves, area,
                            concentration)
                        VALUES 
                          (${idFile}, '${daughter.nameMeta}',
                           ${body.idCalibCurve}, ${daughter.area},
                           ${daughter.concentration})
                        ON CONFLICT (id_file, id_mol, id_calib_curves) 
                        DO UPDATE SET concentration = ${daughter.concentration},
                                      area = ${daughter.area}`
                    ));
                }
            }
            return Promise.all(lQueryPromises);
        })
        .then(() => {
            // update the calibration curve name
            return client.query(`
                UPDATE calib_curves
                SET name = '${body.nameCalibCurve}'
                WHERE id = ${body.idCalibCurve}`
            );
        })
        .catch((err: Error) => {
            throw err;
        })
        .finally(() => client.end());
});