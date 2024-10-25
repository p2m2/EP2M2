// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// call the ChEBI API from webservice 
// https://www.ebi.ac.uk/chebi/webServices.do

// We can call this file like /api/ChEBI?search=epi

import { getLiteEntity, getCompleteEntity } from "./function/search";

export default defineEventHandler(async (event) => {
    const {search,id} = getQuery(event);

    // Miss parameter
    if (!search && !id) {
        throw new Error(`Erreur miss search parameter`);
    }

    if (id) {
        return await getCompleteEntity(id as string);
    }
    return await getLiteEntity(search as string);
})

