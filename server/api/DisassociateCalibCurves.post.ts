// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";
import { updateRatio } from "./function/updateRatio";

export default defineEventHandler((event) => {
    return readBody(event)
        .then((body) => {
           
            const client = new pg.Client();
            return client.connect()

                .then(() => client.query(`DELETE FROM proj_calib_curves
                                          WHERE id_calib_curves IN 
                                          (${body.calibCurves.join(",")})
                                          AND id_project = ${body.id_project}`))
                .then(() => {updateRatio(body.id_project)})
                .finally(() => client.end());
        });
});