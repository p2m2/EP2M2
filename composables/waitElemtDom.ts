/**
 * SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
 * SPDX-License-Identifier: MIT
 * 
 * Wait changing of element in DOM
 */

/**
 * Wait changing of element in DOM
 * @param selector string : css selector of element to follow
 * @param adding true: wait adding element in Dow; false: wait removing in Dom
 * @returns Promise<HTMLElement> : resolve when element is added or 
 *                                 removed in DOM
 */
// thx https://stackoverflow.com/a/61511955
export function waitElemtDom(selector:string, adding:boolean = true) {
    return new Promise(resolve => {
        // element already in DOM
        if (document.querySelector(selector) && adding) {
            return resolve(0);
        }

        const observer = new MutationObserver(() => {
            // Check if the element now exists in the DOM
            if(adding){
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(0);
                }
            // Check if the element no longer exists in the DOM
            } else if (document.querySelector(selector) == null) {
                observer.disconnect();
                resolve(0);
            }            
        });

        // Start observing the DOM for the element
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
