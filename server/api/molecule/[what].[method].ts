// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import * as mol from "./functions"

export default defineEventHandler(async (event: any) => {
    const what = getRouterParam(event, "what");
    const method = getRouterParam(event, "method");

    const funcMap: { [key: string]: Function } = {
        "get-search": mol.getSearch,
        "get-equivalent": mol.getEquivalent,
        "get-synonym": mol.getSynonym,
        "post-molecule": mol.addMolecule,
        "put-molecule": mol.updateMolecule,
    };

    if (!funcMap[`${what}-${method}`]) {
        throw new Error(`Invalid method ${method} for ${what}`);
    }

    const body = await readBody(event)
    return await funcMap[`${what}-${method}`](body.json());

});