// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import Table from "../class/tableClass";

export default defineEventHandler(async (event) => {
    const action = getRouterParam(event, "action");
    
    const body = await readBody(event);
    
    const table = await new Table(body.nameTable);
   
    switch(action){
    case "header":
        return table.header;
    case "nbPages":
        return await table.getNbPage(body.itemByPage);
    case "getPage":
        return await table.getPage(body.page, body.itemByPage, body.sortBy);
    case "totalItems":
        return await table.totalItems();
    case "add":   
        return await table.add(body.items);
    case "rows":
        return await table.getRows(body.wheres);
    case "update":
        return await table.update(body.id, body.columns);
    case "delete":
        return await table.del(body.id);
    default:
        return table.header;
    }

});