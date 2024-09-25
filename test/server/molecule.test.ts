// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { addMolecule, updateMolecule, type tMolecule, } from "~/server/api/molecule/functions";
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

        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
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
        const result = await addMolecule({
            id: null,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [],
            synonyms: []
        } as tMolecule)
        expect(result).toBe(0);
    });

    test('add molecule with eqivalent and synonym', async () => {

        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });

        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("INSERT INTO") && query.includes("molecule")) {
                values.map((val) => expect(["voglibose", "C10H21NO7", 267.277]).toContain(val));
                ["name", "formula", "mass"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else if (query.includes("INSERT INTO") && query.includes("equivalent")) {
                values.map((val) => expect([1,0]).toContain(val));
                ["id_mol_0", "id_mol_1"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else if (query.includes("INSERT INTO") && query.includes("synonym")) {
                values.map((val) => expect([1, "vog"]).toContain(val));
                ["id_mol", "name"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else{
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });

        const result = await addMolecule({
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vog"]
        } as unknown as tMolecule)
        expect(result).toBe(0);

    });

    test('modif molecule: add synonym', async () => {
        (queryDatabase as Mock).mockResolvedValueOnce({
                    rows: [{
                        id: 1,
                        name: "voglibose",
                        formula: "C10H21NO7",
                        mass: 267.277,
                        equivalent: [0],
                        synonym: ["vague"]
                    }]
        });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });

        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT") 
                && query.includes("FROM view_complete_molecule") 
                && query.includes("WHERE id = $1")) {
                expect(values).toContain([1]);

            }
            else if (query.includes("DELETE FROM") && query.includes("synonym")) {
                expect(values).toContain([1]);
                expect(query.includes("WHERE id_molecule = $1")).toBe(true)
            }
            else if (query.includes("INSERT INTO") && query.includes("synonym")) {
                values.map((val) => expect([1, "vog"]).toContain(val));
                ["id_mol", "name"].map((inc) => 
                    expect(query.includes(inc)).toBe(true)
                );
            }
            else {
                assert.fail("Call to queryDatabase with unexpected query " + query);
            }
        });
        const result = await updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague", "vog"]
        })
        expect(result).toBe(0);
    });

    test('modif molecule: delete synonym', async () => {

        (queryDatabase as Mock).mockResolvedValueOnce({
                    rows: [{
                        id: 1,
                        name: "voglibose",
                        formula: "C10H21NO7",
                        mass: 267.277,
                        equivalent: [0],
                        synonym: ["vague", "vog"]
                    }]
                });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT")
                && query.includes("FROM view_complete_molecule")
                && query.includes("WHERE id = $1")) {
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
        const result = await updateMolecule({
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
                        id: 1,
                        name: "voglibose",
                        formula: "C10H21NO7",
                        mass: 267.277,
                        equivalent: [0],
                        synonym: ["vague"]
                    }]
                });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT")
                && query.includes("FROM view_complete_molecule")
                && query.includes("WHERE id = $1")) {
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

        const result = await updateMolecule({
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
                id: 1,
                name: "voglibose",
                formula: "C10H21NO7",
                mass: 267.277,
                equivalent: [0, 2],
                synonym: ["vague"]
            }]
        });
        (queryDatabase as Mock).mockResolvedValueOnce({ rows: [] });
        (queryDatabase as Mock).mockImplementation((query: string,
                                                    values: any[]) => {
            if (query.includes("SELECT")
                && query.includes("FROM view_complete_molecule")
                && query.includes("WHERE id = $1")) {
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
        const result = await updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague"]
        })
        expect(result).toBe(0);
    });
});