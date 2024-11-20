// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This file profides function to compare arrays
// Compare two array without considering the order of the elements

/**
 * Compare two arrays without considering the order of the elements
 * @param arr1 array
 * @param arr2 array
 * @returns boolean true if the arrays are equal, false otherwise
 */
export function compareArray(arr1: any[], arr2: any[]): boolean {
    // Check if the arrays have the same length
    if (arr1.length !== arr2.length) {
        return false;
    }
    
    // Check if all elements of arr1 are in arr2
    for (const elem of arr1) {
        // If an element of arr1 is not in arr2, return false    
        if (!arr2.includes(elem)) {
            return false;
        }
    }
    
    return true;
  }