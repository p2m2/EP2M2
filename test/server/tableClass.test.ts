import { describe, test } from "vitest";
import Table from "~/server/api/class/tableClass";


describe("tableClass", async ()=>{

    test("Check create table object", async ()=>{
        expect(await(new Table("users"))).toBeInstanceOf(Table);
    });

    test("bad name table",async ()=>{
        expect(await(new Table("unknow"))).toThrowError(/^unknow table doesn't exist$/);
    });

    // Define structure of compound table
    const compound:{columnName:string, type:string, maxLength:number|null}[] = [
        {columnName:"id", type:"integer", maxLength:null},
        {columnName:"name", type:"character varying", maxLength:255},
        {columnName:"url", type:"character varying", maxLength:255},
        {columnName:"description", type:"text", maxLength:null},
        {columnName:"archive_date", type:"timestamp with time zone",
            maxLength:null},
    ];
    const compTable = await (new Table("compound"));
    const compHeader = compTable.header;

    test("Check number of header without id", ()=>{
        expect(compHeader.length).toBe(compound.length - 1);
    });


    test("getHearder", () => {

    });

});