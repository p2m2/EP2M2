// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

export { tColumns};

declare global {
    // define array of vetify column
    interface tColumns{
        columns: tHeader[]
    }
}