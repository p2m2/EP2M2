// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import {addMolecule, updateMolecule, type tMolecule, } from "~/server/api/molecule/functions";
import { expect, test, describe, vi } from 'vitest';
import {config } from '@vue/test-utils';

// mock call to database

// Mock confirm box
const mockQuery = vi.fn(()=> console.log("plouf"));
vi.stubGlobal('queryDatabase',mockQuery);

// const mPart = { query: vi.fn() };
// vi.mock('pg', async( importOriginal) => {
//     const actual = await importOriginal()
//     return {
//         ...actual,
//         Pool: vi.fn(() => mPart),
//         Client: vi.fn(() => mPart)
//     };
// });

describe("molecule", async () => {
    beforeEach(async () => {
        // abort a tag without delete inside
        config.global.renderStubDefaultSlot = true
        vi.resetAllMocks();
    })
    test('add molecule', async () => {
        // mockQuery.mockResolvedValue({ rows: [{ id: 0 }] });

        const result = await addMolecule({
                id:null,
                name: "voglibose",
                formula: "C10H21NO7",
                mass: 267.277,
                equivalents:[],
                synonyms:[]
            } as tMolecule)
        // expect(result).toBe(0);
        // expect(mockQuery).toHaveBeenCalledWith("INSERT INTO molecule (name, formula, mass) VALUES ($1, $2, $3) RETURNING id", ["voglibose", "C10H21NO7", 267.277]);

    });

    test('add molecule with eqivalent and synonym', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        const result = await addMolecule({
                name: "voglibose",
                formula: "C10H21NO7",
                mass: 267.277,
                equivalents: [0],
                synonyms: ["vog"]
            })
        expect(result).toBe(0);
        expect(mockQuery).toHaveBeenCalledWith("INSERT INTO molecule (name, formula, mass) VALUES ($1, $2, $3) RETURNING id", ["voglibose", "C10H21NO7", 267.277]);
        expect(mockQuery).toHaveBeenCalledWith("INSERT INTO equivalent (id_mol_0, id_mol_1) VALUES ($1, $2)", [1, 0]);
        expect(mockQuery).toHaveBeenCalledWith("INSERT INTO synonym (id_mol, name) VALUES ($1, $2)", [1, "vog"]);

    });

    test('modif molecule: add synonym', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ 
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalent: [0],
            synonym: ["vague"]
        }] });

        const result = updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague", "vog"]
            })
        expect(result).toBe(0);
        expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM view_complete_molecule WHERE id = $1", [1]);
        expect(mockQuery).toHaveBeenCalledWith("INSERT INTO synonym (id_mol, name) VALUES ($1, $2)", [1, "vog"]);
    });

    test('modif molecule: delete synonym', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ 
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalent: [0],
            synonym: ["vague", "vog"]
        }] });

        const result = await updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague"]
            })
        expect(result).toBe(0);
        expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM view_complete_molecule WHERE id = $1", [1]);
        expect(mockQuery).toHaveBeenCalledWith("DELETE FROM synonym WHERE id_mol = $1 AND name = $2", [1, "vog"]);
    });

    test('modif molecule: add equivalent', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ 
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalent: [0],
            synonym: ["vague"]
        }] });

        const result = await updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0, 2],
            synonyms: ["vague"]
            })
        expect(result).toBe(0);
        expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM view_complete_molecule WHERE id = $1", [1]);
        expect(mockQuery).toHaveBeenCalledWith("INSERT INTO equivalent (id_mol_0, id_mol_1) VALUES ($1, $2)", [1, 2]);
    });

    test('modif molecule: delete equivalent', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ 
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalent: [0, 2],
            synonym: ["vague"]
        }] });

        const result = await updateMolecule({
            id: 1,
            name: "voglibose",
            formula: "C10H21NO7",
            mass: 267.277,
            equivalents: [0],
            synonyms: ["vague"]
            })
        expect(result).toBe(0);
        expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM view_complete_molecule WHERE id = $1", [1]);
        expect(mockQuery).toHaveBeenCalledWith("DELETE FROM equivalent WHERE id_mol_0 = $1 AND id_mol_1 = $2 OR id_mol_0 = $2 AND id_mol_1 = $1", [1, 2]);
    });
});