// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file provides functions to handle molecule-related operations

import { compareArray } from '../function/compareArray';
import { queryDatabase } from '../function/database';

export {getCheck, getMolecule, getSearch, getEquivalent, getSynonym, 
        addMolecule, updateMolecule, tMolecule };

interface tMolecule {
    id: number|null | undefined,
    name: string,
    formula: string,
    mass: number,
    synonyms?: string [] | [] | undefined,
    userSyns?: string [] | [] | undefined,
    equivalent?: number  | undefined

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
        console.log('error Database is empty');
        return false;
    });
}

/**
 * Get a molecule from the database
 * @param id number the molecule id
 * @returns molecule info or an error code
 */
async function getMolecule(id: number): Promise<any> {
    const myMolecule:tMolecule  = {
        id: id,
        name: '',
        formula: '',
        mass: 0,
        synonyms: [],
        userSyns: [],
        equivalent: undefined
    };
    // Get molecule from the database
    const molecule = await queryDatabase(`
        SELECT name, formula, mass, id_equivalent
        FROM molecule
        WHERE id = $1`,
        [id])
    .then((result) => result.rows[0])
    .catch((error) => {
        console.log("getMolecule: ", error);
        return 1
    });
    if (molecule === 1) {
        return 1;
    }
    myMolecule.name = molecule.name;
    myMolecule.formula = molecule.formula;
    myMolecule.mass = molecule.mass;
    myMolecule.equivalent = molecule.id_equivalent;


    // Get ChEBI synonyms of molecule 
    const synonyms: string[]|[] = await queryDatabase(`
        SELECT name
        FROM synonym
        WHERE id_mol = $1 AND is_user = $2`,
        [id, false])
    .then((result) => result.rows.map( (row: { name: string; }) => row.name))
    .catch(() => []);
    myMolecule.synonyms.push(...synonyms);

    // Get user synonyms of molecule
    const userSyns: string[]|[] = await queryDatabase(`
        SELECT name
        FROM synonym
        WHERE id_mol = $1 AND is_user = $2`,
        [id, true])
    .then((result) => result.rows.map( (row: { name: string; }) => row.name))
    .catch(() => []);
    myMolecule.userSyns.push(...userSyns);

    return myMolecule;
}

/**
 * looking for molecules in the database
 * @param search string of elements to search (name, formula, mass, synonyms)
 * @returns list of molecules or an error code
 */
function getSearch(search: string): Promise<any> {
    // Get all molecules from the database
    return queryDatabase(`
        SELECT DISTINCT molecule.id, molecule.name, molecule.formula, molecule.mass
        FROM molecule
        LEFT JOIN synonym s ON s.id_mol = molecule.id
        WHERE molecule.name ILIKE $1
        OR molecule.formula ILIKE $1
        OR molecule.mass::text ILIKE $1
        OR s.name ILIKE $1`,
        [`%${search}%`])
    .then((result) => result.rows)
    .catch((error) => {
        console.log("getSearch: ", error);
        return 1});
}

/**
 * Get equivalent molecules from the database
 * @param id number the molecule id
 * @returns name of equivalent molecule or an error code
 */
function getEquivalent(id: number): Promise<string | number> {
     // Get unique name of equivalent molecules from the database
    return queryDatabase(`
        SELECT name
        FROM molecule
        WHERE id = $1`,
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
        WHERE id_mol = $1`,
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
    // define request about equivalent molecule
    let request = `INSERT INTO molecule (name, formula, mass, id_equivalent)
                   VALUES ($1, $2, $3, $4) RETURNING id`;   
    let args = [mol.name, mol.formula, mol.mass, mol.equivalent];
    if (typeof(mol.equivalent) !== 'number') {
        request = `INSERT INTO molecule (name, formula, mass)
                   VALUES ($1, $2, $3) RETURNING id`;
        args = [mol.name, mol.formula, mol.mass];
    }
    return queryDatabase(request, args)
    .then((result) => {        
        const aPromises = [];
        if (mol.synonyms && mol.synonyms.length>0) {
            aPromises.push(addSynonyms(result.rows[0].id, mol.synonyms, false));
        }
        return Promise.all(aPromises);
    })
    .then(() => 0)
    .catch((error) => {
        console.log("addMolecule: ", error);
        
        return 1;
    });
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
            INSERT INTO synonym (id_mol, name, is_user) 
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
    return queryDatabase(`SELECT * FROM func_synonym_molecule($1)`, [mol.id])
    .then((res) => {
        const lPromises = [];
        // Check if the molecule has synonyms to update
        if (mol.synonyms && 
            !compareArray(res.rows[0].synonym, 
                          [...(mol.synonyms || []), ...(mol.userSyns || [])])) {
            lPromises.push(updateSynonyms(mol.id, (mol.userSyns || [])));
        }
        // Update equivalent of the molecule
        lPromises.push(updateEquivalent(mol.id, (mol.equivalent || "")));
        
        return Promise.all(lPromises);
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
        DELETE FROM synonym WHERE id_mol = $1 AND is_user = $2`,
        [idMolecule, true])
        // Insert all synonyms into the database
        .then(() => {
            addSynonyms(idMolecule, userSyn, true);
        });
}

/**
 * Update equivalents of a molecule in the database
 * @param idMolecule id of the molecule
 * @param equivalents equivalent molecule ids
 * @returns Promise<void>
 */
function updateEquivalent(idMolecule: number, equivalent: any): Promise<void> {
    // Delete all equivalents of the molecule from the database
    if (typeof(equivalent) !== 'number') {
        return queryDatabase(`
            UPDATE molecule
            SET id_equivalent = NULL
            WHERE id = $1`,[idMolecule]);
    }
    return queryDatabase(`
            UPDATE molecule
            SET id_equivalent = $1
            WHERE id = $2`,[equivalent, idMolecule]);
}