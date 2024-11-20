// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT


import { describe, test } from "vitest";
import { getLiteEntity, getCompleteEntity } from "~/server/api/ChEBI/function/search";
/**
 * Check we all results from getChEBI are correct
 * @param wishValue - the expected value
 * @param result - the result from getChEBI
 */

describe("ChEBI getLiteEntity", async () => {

    function checkGetChEBI(wishValue: tChEBI[], result: tChEBI[]) {
        expect(result.length).toBe(wishValue.length);
        // check each result
        for (let i = 0; i < wishValue.length; i++) {
            // Get index of wishValue[i] in result
            const index = result.findIndex((value) => {
                return value.id === wishValue[i].id;
            });
            expect(index).not.toBe(-1);
            // check all fields
            expect(result[index].id).toBe(wishValue[i].id);
            expect(result[index].name).toBe(wishValue[i].name);
            expect(result[index].formula).toBe(undefined);
            expect(result[index].mass).toBe(undefined);
        }
    }

    test('Complete name of molecule', async () => {
        const result = await getLiteEntity("Voglibose");

        expect(typeof (result)).not.toBe("number");
        const resType = result as tChEBI[];
        expect(resType.length).toBe(1);
        expect(resType[0].id).toBe("CHEBI:32300");
        expect(resType[0].name).toBe("Voglibose");
        expect(resType[0].formula).toBe(undefined);
        expect(resType[0].mass).toBe(undefined);
    });
    test('Partial name of molecule', async () => {
        const wishValue = [
            {
                name: "levoglucosan", id: "CHEBI:30997", formula: "C6H10O5",
                mass: 162.141
            },
            {
                name: "isolevoglucosenone", id: "CHEBI:32577", formula: "C6H6O3",
                mass: 126.11004
            },
            {
                name: "3-dehydrolevoglucosan", id: "CHEBI:144894", formula: "C6H8O5",
                mass: 160.125
            },
            {
                name: "levoglucosenone", id: "CHEBI:30999", formula: "C6H6O3",
                mass: 126.11004
            },
        ];
        const result = await getLiteEntity("Vogluc*");
        expect(typeof (result)).not.toBe("number");
        const resType = result as tChEBI[];
        checkGetChEBI(wishValue, resType);
    });

    test('CHEBID', async () => {
        const wishValue = [
            {
                id: "CHEBI:32300", name: "Voglibose", formula: "C10H21NO7",
                mass: 267.277
            }
        ];
        const result = await getLiteEntity("CHEBI:32300");
        expect(typeof (result)).not.toBe("number");
        const resType = result as tChEBI[];
        checkGetChEBI(wishValue, resType);
    });

    test('partial CHEBID', async () => {
        const wishValue = [
            { id: "CHEBI:15378", name: "hydron", formula: "H", mass: 1.00784 },
            {
                id: "CHEBI:17568", name: "uracil", formula: "C4H4N2O2",
                mass: 112.08684
            },
            {
                id: "CHEBI:59891", name: "ureidoacrylate", formula: "C4H5N2O3",
                mass: 129.09410
            },
            {
                id: "CHEBI:62360", name: "propyl beta-D-mannopyranosyl-(1->2)-beta-D-mannopyranosyl-(1->2)-2-thio-beta-D-mannopyranoside",
                formula: "C21H38O15S", mass: 562.58200
            },
            {
                id: "CHEBI:144890", name: "FMN-N(5)-oxide(3-)",
                formula: "C17H18N4O10P", mass: 469.324
            },
            {
                id: "CHEBI:176498", name: "FMN-N(5)-peroxide(2-)",
                formula: "C17H21N4O11P", mass: 488.347
            }
        ];
        const result = await getLiteEntity("62360*");
        expect(typeof (result)).not.toBe("number");
        const resType = result as tChEBI[];
        checkGetChEBI(wishValue, resType);
    });

    test('Formula', async () => {
        const wishValue = [
            {
                id: "CHEBI:17790", name: "methanol", formula: "CH4O",
                mass: 32.04186
            },
        ];
        const result = await getLiteEntity("CH4O");
        expect(typeof (result)).not.toBe("number");
        const resType = result as tChEBI[];
        checkGetChEBI(wishValue, resType);
    });

    test('Partial formula', async () => {
        const wishValue = [
            {
                id: "CHEBI:15862", name: "ethylamine", formula: "C2H7N",
                mass: 45.08370
            },
            {
                id: "CHEBI:17170", name: "dimethylamine", formula: "C2H7N",
                mass: 45.08372
            },
            {
                id: "CHEBI:53593", name: "poly(carbazole-3,6-diyl) macromolecule",
                formula: "C12H7N", mass: Number.NaN
            },
            {
                id: "CHEBI:53595", name: "poly(carbazole-2,7-diyl) macromolecule",
                formula: "C12H7N", mass: Number.NaN
            },
            {
                id: "CHEBI:53597", name: "poly(carbazole-1,8-diyl) macromolecule",
                formula: "C12H7N", mass: Number.NaN
            },
        ];
        const result = await getLiteEntity("*2H7N");
        expect(typeof (result)).not.toBe("number");
        const resType = result as tChEBI[];
        checkGetChEBI(wishValue, resType);
    });

    test('nothing as search', async () => {
        const result = await getLiteEntity("");
        expect(result).toBe(1);
    });

});

describe("ChEBI getCompleteEntity", async () => {

    function checkGetChEBIID(wishValue: tChEBI, result: tChEBI) {

        // check all fields
        expect(result.id).toBe(wishValue.id);
        expect(result.name).toBe(wishValue.name);
        expect(result.formula).toBe(wishValue.formula);
        expect(result.mass).toBe(wishValue.mass);

        if(wishValue.synonyms){
            expect(result.synonyms?.length).toBe(wishValue.synonyms?.length);

            for (const synonym of result.synonyms as string[]) {
                expect(wishValue.synonyms).toContain(synonym)
            }
        }

    }

    test("ChEBI ID", async () => {
        const wishValue = {
            "id": "CHEBI:32300",
            "name": "Voglibose",
            "formula": "C10H21NO7",
            "mass": 267.277,
            "synonyms": [
                "3,4-Dideoxy-4-[[2-hydroxy-1-(hydroxymethyl)ethyl]amino]-2-C-(hydroxymethyl)-D-epi-inositol",
                "AO-128",
                "Basen (TN)",
                "glustat",
                "Voglibose",
                "voglistat"
            ]
        }
        const result = await getCompleteEntity("CHEBI:32300");
        expect(typeof (result)).not.toBe("number");

        const resType = result as tChEBI;
        checkGetChEBIID(wishValue, resType);
    });

    test("secondary ChEBI ID", async () => {
        const wishValue = {
            "id": "CHEBI:15452",
            "name": "(R)-3-hydroxybutanoyl-CoA",
            "formula": "C25H42N7O18P3S",
            "mass": 853.62464,
            "synonyms": [
                "(3R)-3-Hydroxybutanoyl-CoA",
                "(R)-3-Hydroxybutanoyl-CoA"
            ]
        }
        const result = await getCompleteEntity("CHEBI:323");
        expect(typeof (result)).not.toBe("number");

        const resType = result as tChEBI;
        checkGetChEBIID(wishValue, resType);
    })

    test("ChEBI ID without header", async () => {
        const wishValue = {
            "id": "CHEBI:32300",
            "name": "Voglibose",
            "formula": "C10H21NO7",
            "mass": 267.277,
            "synonyms": [
                "3,4-Dideoxy-4-[[2-hydroxy-1-(hydroxymethyl)ethyl]amino]-2-C-(hydroxymethyl)-D-epi-inositol",
                "AO-128",
                "Basen (TN)",
                "glustat",
                "Voglibose",
                "voglistat"
            ]
        }
        const result = await getCompleteEntity("32300");
        expect(typeof (result)).not.toBe("number");

        const resType = result as tChEBI;
        checkGetChEBIID(wishValue, resType);
    });

    test('only with header', async () => {
        const result = await getCompleteEntity("CHEBI:");
        expect(result).toBe(1);
    });

    test('nothing as search', async () => {
        const result = await getCompleteEntity("");
        expect(result).toBe(1);
    });
});