// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import {getEquivalent, getSynonym, addMolecule, updateMolecule} from "./functions"

export default defineEventHandler(async (event) => {
    const what = getRouterParam(event, "what");
    const method = getRouterParam(event, "method");

    const funcMap: { [key: string]: Function } = {
        "get-equivalent": getEquivalent,
        "get-synonym": getSynonym,
        "post-molecule": addMolecule,
        "put-molecule": updateMolecule,
    };

    if (!funcMap[`${what}-${method}`]) {
        throw new Error(`Invalid method ${method} for ${what}`);
    }

    const body = await readBody(event)
    return await funcMap[`${what}-${method}`](body.json());

});