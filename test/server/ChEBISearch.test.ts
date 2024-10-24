// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT


import { describe, test } from "vitest";
import {searchGlobal} from "~/server/api/ChEBI/function/search.ts";
/**
 * Check we all results from getChEBI are correct
 * @param wishValue - the expected value
 * @param result - the result from getChEBI
 */
function checkGetChEBI(wishValue: tChEBI[], result: tChEBI[]){
    expect(result.length).toBe(wishValue.length);
    // check each result
    for(let i = 0; i < wishValue.length; i++){
        // Get index of wishValue[i] in result
        const index = result.findIndex((value) => {
            return value.id === wishValue[i].id;
        });
        expect(index).not.toBe(-1);
        // check all fields
        expect(result[index].id).toBe(wishValue[i].id);
        expect(result[index].name).toBe(wishValue[i].name);
        expect(result[index].formula).toBe(wishValue[i].formula);
        expect(result[index].mass).toBe(wishValue[i].mass);
    }
}


describe("getChEBI", async ()=>{

    test('Complete name of molecule', async ()=>{
        const result:tChEBI[] = await searchGlobal("Voglibose");
        console.log(result);
        
        expect(result.length).toBe(1);
        expect(result[0].id).toBe("CHEBI:32300");
        expect(result[0].name).toBe("voglibose");
        expect(result[0].formula).toBe("C10H21NO7");
        expect(result[0].mass).toBe(267.277);
    });
    test.todo('Partial name of molecule', async ()=>{
        const wishValue = [
            {name:"levoglucosan", id:"CHEBI:30997", formula:"C6H10O5",
             mass:162.141},
            {name:"isolevoglucosenone", id:"CHEBI:32577", formula:"C6H6O3",
             mass:126.11004},
            {name:"3-dehydrolevoglucosan", id:"CHEBI:144894", formula:"C6H8O5",
             mass:160.125},
            {name:"levoglucosenone", id:"CHEBI:30999", formula:"C6H6O3",
             mass:126.11004},            
        ];
        const result:tChEBI[] = await $fetch("api/getChEBI?search=Vogluc*");
        checkGetChEBI(wishValue, result);
    });

    test.todo('CHEBID', async ()=>{
        const wishValue = [
            {id: "CHEBI:32300", name: "voglibose", formula: "C10H21NO7",
             mass: 267.277}
        ];
        const result:tChEBI[] = await $fetch("api/getChEBI?search=CHEBI:32300");
        checkGetChEBI(wishValue, result);
    });

    test.todo('partial CHEBID', async ()=>{
        const wishValue = [
            {id: "CHEBI:15378", name:"hydron", formula:"H", mass:1.00784},
            {id: "CHEBI:17568", name:"uracil", formula:"C4H4N2O2",
             mass:112.08684},
            {id: "CHEBI:59891", name:"ureidoacrylate", formula:"C4H5N2O3",
             mass:129.09410},
            {id:"CHEBI:62360", name:"propyl β-D-mannopyranosyl-(1→2)-β-D-mannopyranosyl-(1→2)-2-thio-β-D-mannopyranoside",
             formula:"C21H38O15S", mass:562.58200},
            {id:"CHEBI:144890", name:"FMN-N5-oxide(3−)",
             formula:"C17H18N4O10P", mass:469.324},
            {id:"CHEBI:176498", name:"FMN-N5-peroxide(2−)",
             formula:"C17H21N4O11P", mass:488.347}
        ];
        const result:tChEBI[] = await $fetch("api/getChEBI?search=62360*");
        checkGetChEBI(wishValue, result);
    });

    test.todo('Formula', async ()=>{
        const wishValue = [
            {id: "CHEBI:17790", name: "methanol", formula: "CH4O",
             mass: 32.04186},
        ];
        const result:tChEBI[] = await $fetch("api/getChEBI?search=CH4O");
        checkGetChEBI(wishValue, result);
    });

    test.todo('Partial formula', async ()=>{
        const wishValue = [
            {id: "CHEBI:15862", name:"ethylamine", formula:"C2H7N",
             mass:45.08370},
            {id: "CHEBI:17170", name:"dimethylamine", formula:"C2H7N",
            mass:45.08372},
            {id: "CHEBI:53593", name:"poly(carbazole-3,6-diyl) macromolecule",
             formula:"C12H7N", mass:Number.NaN},
            {id: "CHEBI:53595", name:"poly(carbazole-2,7-diyl) macromolecule",
             formula:"C12H7N", mass:Number.NaN},
            {id: "CHEBI:53597", name:"poly(carbazole-1,8-diyl) macromolecule",
             formula:"C12H7N", mass:Number.NaN},
        ];
        const result:tChEBI[] = await $fetch("api/getChEBI?search=*2H7N");
        checkGetChEBI(wishValue, result);
    });

});