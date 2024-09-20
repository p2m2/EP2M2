// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import { queryDatabase } from '../function/database';

export default defineEventHandler(async (event) => {
    const what = getRouterParam(event, "what");
    const method = getRouterParam(event, "method");

    const funcMap: { [key: string]: Function } = {
        "get-equivalent": getEquivalent,
        "get-synonym": getSynonym,
        "post-molecule": addMolecule,
        "put-molecule": updateMolecule,
    };

    if (!funcMap[`${what}-${method}`]) {
        throw new Error(`Invalid method ${method} for ${what}`);
    }

    return await funcMap[`${what}-${method}`](event);

});

/**
 * Get equivalent molecules from the database
 * @param event Body of the request containing the molecule id
 * @returns list of equivalent molecules or an error code
 */
function getEquivalent(event: any): Promise<string[] | number> {
    return readBody(event)
        .then((body) => {
            return body.json();
        })
        .then((json) => {
            // Get unique name of equivalent molecules from the database
            return queryDatabase(`
                SELECT array_agg(DISTINCT molecule.name) AS name
                FROM molecule
                JOIN equivalent e ON e.id_mol_1 = molecule.id 
                                  OR e.id_mol_2 = molecule.id
                WHERE e.id_mol_1 = $1' OR e.id_mol_2 = $1`,
                [json.id]);
        })
        .then((result) => result.rows[0].name)
        .catch(() => 1);
}

/**
 * Get synonyms of a molecule from the database
 * @param event  Body of the request containing the molecule id
 * @returns list of synonyms or an error code
 */
function getSynonym(event: any): Promise<string[] | number> {
    return readBody(event)
        .then((body) => {
            return body.json();
        })
        .then((json) => {
            // Get all synonyms of the molecule from the database
            return queryDatabase(`
                SELECT name
                FROM synonym
                WHERE id_molecule = $1`,
                [json.id]);
        })
        .then((result) => result.rows.map(
            (row: { name: string; }) => row.name))
        .catch(() => 1);
}

/**
 * Add a new molecule to the database
 * @param event 
 * @returns number 0 if the operation is successful, 1 otherwise
 */
function addMolecule(event: any): Promise<number> {
    let aSynonyms: string[];
    let aEquivalents: number[];
    return readBody(event)
        .then((body) => body.json())
        .then((json) => {
            aSynonyms = json.synonyms || [];
            aEquivalents = json.equivalents || [];
            // Insert a new molecule into the database
            return queryDatabase(`
                INSERT INTO molecule (name, formula, mass) 
                VALUES ($1, $2, $3) RETURNING id`,
                [json.name, json.formula, json.mass]);
        })
        .then((result) => {
            const aPromises = [];
            if (aEquivalents.length) {
                aPromises.push(addEquivalents(result.rows[0].id,
                    aEquivalents));
            }
            if (aSynonyms.length) {
                aPromises.push(addSynonyms(result.rows[0].id, aSynonyms));
            }
            return Promise.all(aPromises);
        })
        .then(() => 0)
        .catch(() => 1);
}

/**
 * Add equivalents to a molecule in the database
 * @param idMolecule id of the molecule
 * @param equivalents array of equivalent molecule ids
 * @returns Promise<void>
 */
function addEquivalents(idMolecule: number, equivalents: number[]):
    Promise<void> {
    const promises = equivalents.map((equivalent) => {
        return queryDatabase(`
            INSERT INTO equivalent (id_mol_1, id_mol_2) 
            VALUES ($1, $2)`,
            [idMolecule, equivalent]);
    });
    return Promise.all(promises).then(() => { });
}

/**
 * Add synonyms to a molecule in the database
 * @param idMolecule id of the molecule
 * @param synonyms array of synonyms
 * @returns Promise<void>
 */
function addSynonyms(idMolecule: number, synonyms: string[]): Promise<void> {
    const promises = synonyms.map((synonym) => {
        return queryDatabase(`
            INSERT INTO synonym (id_molecule, name) 
            VALUES ($1, $2)`,
            [idMolecule, synonym]);
    });
    return Promise.all(promises).then(() => { });
}

/**
 * Update a molecule in the database
 * @param event 
 * @returns number 0 if the operation is successful, 1 otherwise
 */
function updateMolecule(event: any): Promise<any> {
    return readBody(event)
        .then((body) => body.json())
        .then((json) => {
            // Get all synonyms and equivalents of the molecule from the database
            return Promise.all([
                updateSynonyms(json.id, json.synonyms),
                updateEquivalent(json.id, json.equivalents)
            ]);
        })
        .then(() => 0)
        .catch(() => 1);
}

/**
 * Update synonyms of a molecule in the database
 * @param idMolecule id of the molecule
 * @param synonyms array of synonyms
 * @returns Promise<void>
 */
function updateSynonyms(idMolecule: number, synonyms: string[]): Promise<void> {
    // Delete all synonyms of the molecule from the database
    return queryDatabase(`
        DELETE FROM synonym WHERE id_molecule = $1`,
        [idMolecule])
        // Insert all synonyms into the database
        .then(() => addSynonyms(idMolecule, synonyms));
}

/**
 * Update equivalents of a molecule in the database
 * @param idMolecule id of the molecule
 * @param equivalents array of equivalent molecule ids
 * @returns Promise<void>
 */
function updateEquivalent(idMolecule: number, equivalents: number[]): Promise<void> {
    // Delete all equivalents of the molecule from the database
    return queryDatabase(`
            DELETE FROM equivalent WHERE id_mol_1 = $1 OR id_mol_2 = $1`,
        [idMolecule])
        // Insert all equivalents into the database
        .then(() => addEquivalents(idMolecule, equivalents));
}