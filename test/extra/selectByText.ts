/** SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * 
 *  SPDX-License-Identifier: MIT
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