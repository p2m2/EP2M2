// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT
// this file is used to update the expected concentration of the daughters
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
                   // update expected concentration
                   lQueryPromises.push(client.query(`
                        UPDATE daughter
                        SET expected = ${daughter.expectedArea}
                        WHERE id_file = ${idFile}
                        AND id_mol = '${daughter.nameMeta}'
                        AND id_calib_curves = ${body.idCalibCurve}`
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