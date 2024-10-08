// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

/** 
* This file provide functions to select a wrapper by different criteria
*/

/**
 * Select a wrapper by its text
 * @param lWrapper html wrapper list
 * @param text required text in wrapper
 * @returns HTML wrapper or null
 */
export function selectByText(lWrapper:any[], text:string){
    // loop on wrapper list
    for(const wrapper of lWrapper){
        // check if wrapper contains text
        if(wrapper.text().includes(text)){
            return wrapper;
        }
    }
    return null;
}

/**
 * Select a input by its value 
 * @param lInput html input list
 * @param value required value in input
 * @returns HTML input or null
 */
export function selectInputByValue(lInput:any[], value:string|number){
    // loop on wrapper list
    for(const input of lInput){
        // check if wrapper contains value
        if(input.element.value.includes(value)){
            return input;
        }
    }
    return null;
}