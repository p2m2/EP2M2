// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import * as mol from "./functions"

export default defineEventHandler(async (event: any) => {   
    // get what to you want to do
    const what = getRouterParam(event, "what");
    // get the method
    const method = event.method.toLowerCase();
    
    // map the method to the function
    const funcMap: { [key: string]: Function } = {
        "get-check": mol.getCheck,
        "get-search": mol.getSearch,
        "get-equivalent": mol.getEquivalent,
        "get-synonym": mol.getSynonym,
        "post-molecule": mol.addMolecule,
        "put-molecule": mol.updateMolecule,
    };

    // check if the method is valid
    if (!funcMap[`${method}-${what}`]) {
        throw new Error(`Invalid method ${method} for ${what}`);
    }

    // In case of a get request, we need to get the query parameters
    if (method === "get") {
        return await funcMap[`${method}-${what}`](getQuery(event).param);
    }
    // In case of a post or put request, we need to get the body
    const body = await readBody(event)
    
    return await funcMap[`${method}-${what}`](body);

});