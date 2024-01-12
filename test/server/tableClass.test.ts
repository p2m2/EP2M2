import { describe, test } from "vitest";
import Table from "~/server/api/class/tableClass";


describe("tableClass", async ()=>{

    test("Check create table object", async ()=>{
        expect(await(new Table("users"))).toBeInstanceOf(Table);
    });

    test("bad name table",async ()=>{
        expect(await(new Table("unknow"))).toThrowError("unknow table does't exist");
    });

    // Define structure of compound table
    const compound:{columnName:string, type:string, maxLength:number|null}[] = [
        {columnName:"id", type:"integer", maxLength:null},
        {columnName:"name", type:"character varying", maxLength:255},
        {columnName:"url", type:"character varying", maxLength:255},
        {columnName:"description", type:"text", maxLength:null}
    ];
    const compTable = new Table("compound");
    const compHeader = compTable.header;

    test("Check number of header", ()=>{
        expect(compHeader.length).toBe(compound.length - 1);
    });

    // const columnNames = resp.rows.map((x:{column_name:string}) => 
    //     x.column_name);
    
    // test("Check name of column", () =>{
    //     // thx : https://stackoverflow.com/a/77081601
    //     expect(new Set(columnNames)).toEqual(
    //         new Set(compound.map(x => x.columnName)));
    // });
    test("getHearder", () => {

    });

});