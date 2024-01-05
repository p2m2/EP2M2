import Table from "../class/tableClass";

export default defineEventHandler(async (event) => {
    console.log(event);
    const action = getRouterParam(event, "action");
    console.log(action);
    
    const nameTable = await readBody(event);
    console.log(nameTable);
    
    const table = await new Table(nameTable.nameTable);

    console.log(table.header);
    
    if (action == "header"){
        return table.header;
    }

    if (action == "nbPages"){
        return table.getNbPage(2);
    }

    if(action == "getPage"){
        return table.getPage(1, 2);
    }
    return table.header;
});