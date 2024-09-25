// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { describe, test } from "vitest";
import Table from "~/server/api/class/tableClass";


describe("tableClass", async ()=>{

    test("Check create table object", async ()=>{
        expect(await(new Table("users"))).toBeInstanceOf(Table);
    });

    test("bad name table",async ()=>{
        expect(await(new Table("unknow"))).toThrowError(/^unknow table doesn't exist$/);
    });

});