// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";
import { updateRatio } from "./function/updateRatio";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const client = new pg.Client();
    return client.connect()
        .then(() => {
            const lValues = [];
            for(const idCalibCurve of body.calibCurves){               
                lValues.push(`(${body.id_project},${idCalibCurve})`);                
            }
            return client.query(`
                INSERT INTO proj_calib_curves(id_project, id_calib_curves)
                VALUES ${lValues.join(",")}`
            )
        })
        // Update the ratio of the metabolite
        .then(() => {updateRatio(body.id_project)})
        .catch((err: Error) => {
            throw err;
        })
        .finally(() => client.end());

});