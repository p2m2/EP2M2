// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

export { tChEBI };

declare global {
    // define a ChEBI molecule
    interface tChEBI {
        id: string,
        name: string,
        formula?: string,
        mass?: number,
        synonyms?: string[],
        inSyns?: string[]
    }

}