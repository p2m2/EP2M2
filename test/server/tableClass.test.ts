// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import Table from "~/server/api/class/tableClass";


describe("tableClass", async ()=>{

    test.todo("Check create table object", async ()=>{
        expect(await(new Table("users"))).toBeInstanceOf(Table);
    });

    test.todo("bad name table",async ()=>{
        expect(await(new Table("unknow"))).toThrowError(/^unknow table doesn't exist$/);
    });

});