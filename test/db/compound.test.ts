import { describe, test } from "vitest";
import pg from "pg";

// Check if compound table is correctly create
describe("Compound table", async ()=>{
    // Define structure of compound table
    const compound:{columnName:string, type:string, maxLength:number|null}[] = [
        {columnName:"id", type:"integer", maxLength:null},
        {columnName:"name", type:"character varying", maxLength:255},
        {columnName:"url", type:"character varying", maxLength:255},
        {columnName:"description", type:"text", maxLength:null}
    ];

    const client = new pg.Client();
    await client.connect();
    // thx https://stackoverflow.com/a/14820046
    // Get struct of table in database
    const resp = await client.query(`SELECT column_name, data_type,
                                                character_maximum_length
                                         FROM information_schema.columns
                                         WHERE table_name='compound';`);

    test("Check number of column", async ()=>{
        expect(resp.rows.length).toBe(compound.length);
    });

    const columnNames = resp.rows.map((x:{column_name:string}) => 
        x.column_name);
    
    test("Check name of column", () =>{
        // thx : https://stackoverflow.com/a/77081601
        expect(new Set(columnNames)).toEqual(
            new Set(compound.map(x => x.columnName)));
    });
    
    // Check type and size of column 
    const validField = function(name:string, type:string,
        length:number|null){
        const index = columnNames.indexOf(name);
        expect(index).not.toBe(-1);
        expect(resp.rows[index].data_type).toBe(type);
        expect(resp.rows[index].character_maximum_length).toBe(length);
    };

    for( const column of compound){
        test("Check "+ column.columnName +" column definition", () =>{
            validField(column.columnName, column.type, column.maxLength);
        });
    }

});