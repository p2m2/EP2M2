// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import { compareArray } from '../function/compareArray';
import { queryDatabase } from '../function/database';

export {getCheck, getSearch, getEquivalent, getSynonym, addMolecule, updateMolecule, tMolecule };

interface tMolecule {
    id: number|null | undefined,
    name: string,
    formula: string,
    mass: number,
    synonyms?: string [] | [] | undefined,
    userSyns?: string [] | [] | undefined,
    equivalents?: number[] | [] | undefined

}

/**
 * check if molecule table isn't empty
 * @returns true if the table isn't empty, false otherwise
 */
const getCheck = () => {
    return queryDatabase(`SELECT * FROM molecule LIMIT 1`,'')
    .then((response) => {
        if (response.rows.length === 0) {
            console.log('Database is empty');
            return false;
        }
        return true;
    })
    .catch(() =>{
        console.log('Database is empty');
        return false;
    });
}


/**
 * looking for molecules in the database
 * @param search string of elements to search (name, formula, mass, synonyms)
 * @returns list of molecules or an error code
 */
function getSearch(search: string): Promise<any> {
    // Get all molecules from the database
    return queryDatabase(`
        SELECT molecule.id, molecule.name, molecule.formula, molecule.mass
        FROM molecule
        LEFT JOIN synonym s ON s.id_mol = molecule.id
        WHERE molecule.name ILIKE $1
        OR molecule.formula ILIKE $1
        OR molecule.mass::text ILIKE $1
        OR s.name ILIKE $1`,
        [`%${search}%`])
    .then((result) => result.rows)
    .catch((error) => {
        console.log(error);
        return 1});
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
    
    // Insert a new molecule into the database
    return queryDatabase(`
        INSERT INTO molecule (name, formula, mass) 
        VALUES ($1, $2, $3) RETURNING id`,
        [mol.name, mol.formula, mol.mass])
    .then((result) => {        
        const aPromises = [];
        if (mol.equivalents && mol.equivalents.length>0) {
            aPromises.push(addEquivalents(result.rows[0].id,
                mol.equivalents));
        }
        if (mol.synonyms && mol.synonyms.length>0) {
            aPromises.push(addSynonyms(result.rows[0].id, mol.synonyms, false));
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
            INSERT INTO equivalent (id_mol_0, id_mol_1) 
            VALUES ($1, $2)`,
            [idMolecule, equivalent]);
    });
    return Promise.all(promises).then(() => { });
}

/**
 * Add synonyms to a molecule in the database
 * @param idMolecule id of the molecule
 * @param synonyms array of synonyms
 * @param user boolean true if the synonyms are added by the user, false otherwise
 * @returns Promise<void>
 */
function addSynonyms(idMolecule: number, synonyms: string[], user: boolean): Promise<void> {
    const promises = synonyms.map((synonym) => {
        return queryDatabase(`
            INSERT INTO synonym (id_molecule, name, user) 
            VALUES ($1, $2, $3)`,
            [idMolecule, synonym, user]);
    });
    return Promise.all(promises);
}

/**
 * Update a molecule in the database
 * @param mol tMolecule info about molecule  
 * @returns number 0 if the operation is successful, 1 otherwise
 */
function updateMolecule(mol: tMolecule): Promise<any> {
    // Check id defined
    if (mol.id === undefined || mol.id === null) {
        return new Promise((resolve)=> resolve(2));
    }
    // Get all synonyms and equivalents of the molecule from the database
    return queryDatabase(`SELECT * FROM func_synonym_equivalent_molecule($1)`, [mol.id])
    .then((res) => {
        const lPromises = [];
        // Check if the molecule has synonyms to update
        if (mol.synonyms && 
            !compareArray(res.rows[0].synonym, 
                          [...(mol.synonyms || []), ...(mol.userSyns || [])])) {
            lPromises.push(updateSynonyms(mol.id, (mol.userSyns || [])));
        }
        // Check if the molecule has equivalents to update
        if (mol.equivalents && !compareArray(res.rows[0].equivalent,
                                             (mol.equivalents || []))) {
            lPromises.push(updateEquivalent(mol.id, (mol.equivalents || [])));
        }
        return Promise.all(lPromises)
    })
    .then(() => 0)
    .catch(() => 1);
}

/**
 * Update user synonyms of a molecule in the database
 * because only user synonyms can be updated
 * @param idMolecule id of the molecule
 * @param userSyn array of user synonyms
 * @returns Promise<void>
 */
function updateSynonyms(idMolecule: number, userSyn: string[]): Promise<void> {
    // Delete all user synonyms of the molecule from the database
    return queryDatabase(`
        DELETE FROM synonym WHERE id_molecule = $1 AND user = $2`,
        [idMolecule, true])
        // Insert all synonyms into the database
        .then(() => {
            addSynonyms(idMolecule, userSyn, true);
        });
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