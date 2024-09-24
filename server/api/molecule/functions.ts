// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import { queryDatabase } from '../function/database';

export { getEquivalent, getSynonym, addMolecule, updateMolecule, tMolecule };

interface tMolecule {
    id: number|null | undefined,
    name: string,
    formula: string,
    mass: number,
    synonyms: string [] | [] | undefined,
    equivalents: number[] | [] | undefined

}
/**
 * Get equivalent molecules from the database
 * @param id number the molecule id
 * @returns list of equivalent molecules or an error code
 */
function getEquivalent(id: number): Promise<string[] | number> {
     // Get unique name of equivalent molecules from the database
    return queryDatabase(`
        SELECT array_agg(DISTINCT molecule.name) AS name
        FROM molecule
        JOIN equivalent e ON e.id_mol_1 = molecule.id 
                            OR e.id_mol_2 = molecule.id
        WHERE e.id_mol_1 = $1' OR e.id_mol_2 = $1`,
        [id])
    .then((result) => result.rows[0].name)
    .catch(() => 1);
}

/**
 * Get synonyms of a molecule from the database
 * @param id number the molecule id
 * @returns list of synonyms or an error code
 */
function getSynonym(id: number): Promise<string[] | number> {
    // Get all synonyms of the molecule from the database
    return queryDatabase(`
        SELECT name
        FROM synonym
        WHERE id_molecule = $1`,
        [id])
    .then((result) => result.rows.map(
        (row: { name: string; }) => row.name))
    .catch(() => 1);
}

/**
 * Add a new molecule to the database
 * @param mol tMolecule info about molecule 
 * @returns number 0 if the operation is successful, 1 otherwise
 */
function addMolecule(mol: tMolecule): Promise<number> {
    console.log(1);
    
    // Insert a new molecule into the database
    return queryDatabase(`
        INSERT INTO molecule (name, formula, mass) 
        VALUES ($1, $2, $3) RETURNING id`,
        [mol.name, mol.formula, mol.mass])
    .then((result) => {
        console.log(2);
        
        const aPromises = [];
        if (mol.equivalents.length) {
            aPromises.push(addEquivalents(result.rows[0].id,
                mol.equivalents));
        }
        if (mol.synonyms.length) {
            aPromises.push(addSynonyms(result.rows[0].id, mol.synonyms));
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
 * @param mol tMolecule info about molecule  
 * @returns number 0 if the operation is successful, 1 otherwise
 */
function updateMolecule(mol: tMolecule): Promise<any> {
    // Get all synonyms and equivalents of the molecule from the database
    return Promise.all([
        updateSynonyms(mol.id, mol.synonyms),
        updateEquivalent(mol.id, mol.equivalents)
    ])
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