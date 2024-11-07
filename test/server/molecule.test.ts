// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import * as mol from "~/server/api/molecule/functions";
import { expect, test, describe, vi, type Mock } from 'vitest';
import { config } from '@vue/test-utils';
import { queryDatabase } from "~/server/api/function/database";


// Mock queryDatabase
vi.mock('~/server/api/function/database', () => ({
    queryDatabase: vi.fn()
}));

describe("molecule", async () => {
    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
        vi.resetAllMocks();
    })
    test('add molecule', async () => {
        // Mock queryDatabase
        // Give id of added molecule
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        // Check if request to add molecule is correct
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("INSERT INTO") && query.includes("molecule")) {
                values.map((val) => expect(["voglibose", "C10H21NO7", 267.277]).toContain(val));
                ["name", "formula", "mass"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
                
            }
            else{
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });

        // Add molecule
        const result = await mol.addMolecule({
            id: null,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277
        } as mol.tMolecule)
        // Check if result is correct
        expect(result).toBe(0);
    });

    test('add molecule with ChEBI synonym', async () => {
            // Mock queryDatabase
            // Give id of added molecule
            (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
            // Response of addSynonym
            (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
             
            (queryDatabase as Mock).mockImplementation((query: string,
                                                        values: any[]) => {
                // Check if request to add molecule is correct   
                if (query.includes("INSERT INTO") && query.includes("molecule")) {
                    values.map((val) => expect(["voglibose", "C10H21NO7", 267.277]).toContain(val));
                    ["name", "formula", "mass"].map((inc) => 
                        expect(query.includes(inc)).toBe(true)
                    );
                }
                // Check if request to add synonym is correct   
                else if (query.includes("INSERT INTO") && query.includes("synonym")) {
                    values.map((val) => expect([1, "AO-128", false]).toContain(val));
                    ["id_mol", "name", "user"].map((inc) => 
                        expect(query.includes(inc)).toBe(true)
                    );
                }
                else{
                    assert.fail("Call to queryDatabase with unexpected query " + query);
                }
            });
    
            const result = await mol.addMolecule({
                name: "voglibose",
                formula: "C10H21NO7",
                mass: 267.277,
                synonyms: ["AO-128"]
            } as unknown as mol.tMolecule)
            expect(result).toBe(0);
    
        }
    );

    test('add molecule with user synonym', async () => {
        // Mock queryDatabase
        // Give id of added molecule
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        // Response of addSynonym
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
         
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            // Check if request to add molecule is correct
            if (query.includes("INSERT INTO") && query.includes("molecule")) {
                values.map((val) => expect(["voglibose", "C10H21NO7", 267.277]).toContain(val));
                ["name", "formula", "mass"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            // Check if request to add synonym is correct
            else if (query.includes("INSERT INTO") && 
                     query.includes("synonym") && 
                     query.includes("false")
                    ) {
                values.map((val) => expect([1, "AO-128", false]).toContain(val));
                ["id_mol", "name", "user"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            // Check if request to add user synonym is correct
            else if (query.includes("INSERT INTO") && 
                     query.includes("synonym") && 
                     query.includes("true")
                    ) {
                values.map((val) => expect([1, "bose", true]).toContain(val));
                ["id_mol", "name", "user"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else{
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });

        // Add molecule
        const result = await mol.addMolecule({
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            synonyms: ["AO-128"],
            user: ['bose']
        } as unknown as mol.tMolecule)
        // Check if result is correct
        expect(result).toBe(0);
    });

    test('add molecule with eqivalent and synonym', async () => {
        // Mock queryDatabase
        // Give id of added molecule
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        // Response of addEquivalents
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        // Response of addSynonyms
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });

        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            // Check if request to add molecule is correct
            if (query.includes("INSERT INTO") && query.includes("molecule")) {
                values.map((val) => expect(["voglibose", "C10H21NO7", 267.277]).toContain(val));
                ["name", "formula", "mass"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            // Check if request to add equivalent is correct
            else if (query.includes("INSERT INTO") && query.includes("equivalent")) {
                values.map((val) => expect([1,0]).toContain(val));
                ["id_mol_0", "id_mol_1"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            // Check if request to add synonym is correct
            else if (query.includes("INSERT INTO") && query.includes("synonym")) {
                values.map((val) => expect([1, "vog", false]).toContain(val));
                ["id_mol", "name", "user"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else{
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });

        // Add molecule
        const result = await mol.addMolecule({
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vog"]
        } as unknown as mol.tMolecule)
        // Check if result is correct
        expect(result).toBe(0);
    });

    test('modif molecule: add synonym', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({
                    rows: [{
                        equivalent: [0],
                        synonym: ["vague"]
                    }]
        });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });

        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT") 
                && query.includes("func_synonym_equivalent_molecule($1)")){
                expect(values).toContain([1]);

            }

            else if (query.includes("DELETE FROM") && query.includes("synonym")) {
                expect(values).toContain([1]);
                expect(query.includes("WHERE id_molecule = $1")).toBe(true)
            }
            else if (query.includes("INSERT INTO") && query.includes("synonym")) {
                values.map((val) => expect([1, "bose", true]).toContain(val));
                ["id_mol", "name", "user"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else {
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });
        const result = await mol.updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague"],
            userSyns: ['bose']
        })
        expect(result).toBe(0);
    });

    test('modif molecule: delete synonym', async () => {

        (queryDatabase as Mock).mockResolvedValueOnce({
                    rows: [{
                        equivalent: [0],
                        synonym: ["vague", "vog"]
                    }]
                });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT")
                && query.includes("func_synonym_equivalent_molecule($1)")) {
                expect(values).toContain([1]);
            }
            else if (query.includes("DELETE FROM") && query.includes("synonym")) {
                expect(values).toContain([1]);
                expect(query.includes("WHERE id_molecule = $1")).toBe(true)
            }
            else {
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });
        const result = await mol.updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague"]
        })
        expect(result).toBe(0);
    });

    test('modif molecule: add equivalent', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({
                    rows: [{
                        equivalent: [0],
                        synonym: ["vague"]
                    }]
                });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT")
                && query.includes("func_synonym_equivalent_molecule($1)")) {
                expect(values).toContain([1]);
            }
            else if (query.includes("DELETE FROM") && query.includes("equivalent")) {
                expect(values).toContain([1]);
                expect(query.includes("WHERE id_molecule = $1")).toBe(true)
            }
            else if (query.includes("INSERT INTO") && query.includes("equivalent")) {
                values.map((val) => expect([1, 2]).toContain(val));
                ["id_mol_0", "id_mol_1"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else {
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });

        const result = await mol.updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0, 2],
            synonyms: ["vague"]
        })
        expect(result).toBe(0);
    });

    test('modif molecule: delete equivalent', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({
            rows: [{
                equivalent: [0, 2],
                synonym: ["vague"]
            }]
        });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT")
                && query.includes("func_synonym_equivalent_molecule($1)")) {
                expect(values).toContain([1]);
            }
            else if (query.includes("DELETE FROM") && query.includes("equivalent")) {
                expect(values).toContain([1]);
                expect(query.includes("WHERE id_molecule = $1")).toBe(true)
            }
            else if (query.includes("INSERT INTO") && query.includes("equivalent")) {
                values.map((val) => expect([1, 0]).toContain(val));
                ["id_mol_0", "id_mol_1"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else {
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });
        const result = await mol.updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague"]
        })
        expect(result).toBe(0);
    });

    test('search molecule', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({
            rows: [{
                id: 1,
                name: "voglibose",
                formula: "C10H21NO7",
                mass: 267.277
            }]
        });
        const result = await mol.getSearch("voglibose");
        expect(result).toEqual([{
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277
        }]);
    }
    );

    test('search molecule with no result', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        const result = await mol.getSearch("voglibose");
        expect(result).toEqual([]);
    });

    test('search molecule with error', async () => {
        (queryDatabase as Mock).mockRejectedValueOnce("error");
        const result = await mol.getSearch("voglibose");
        expect(result).toEqual(1);
    });

    test('check molecule table empty', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        const result = await mol.getCheck();
        expect(result).toBe(false);
    });

    test('check molecule table not empty', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{}] });
        const result = await mol.getCheck();
        expect(result).toBe(true);
    });

});