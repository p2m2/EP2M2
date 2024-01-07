import Table from "../class/tableClass";

export default defineEventHandler(async (event) => {
    const action = getRouterParam(event, "action");
    
    const body = await readBody(event);
    
    const table = await new Table(body.nameTable);
   
    switch(action){
    case "header":
        return table.header;
    case "nbPages":
        return await table.getNbPage(2);
    case "getPage":
        return await table.getPage(body.page, body.itemByPage, body.sortBy);
    case "totalItems":
        return await table.totalItems();
    case "add":   
        return await table.add(body.items);
    default:
        return table.header;
    }

});