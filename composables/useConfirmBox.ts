// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import { waitElemtDom } from "./waitElemtDom";

/**
 * Display a confirm box with a message and wait user answer
 * @param message : string : message to display in confirm box
 * @returns Promise<boolean> : true if user click on "yes" button,
 *                             false if user click on "no/cancel" button
 */

export function useConfirmBox(message: string): Promise<boolean> {
    // Token to dysplay confirm box
    const openConfirmBox = useState<boolean>("openConfirmBox",);
    // Token to store message to display in confirm box
    const msgConfirmBox = useState<string>("msgConfirmBox");

    // Add message to confirm box
    msgConfirmBox.value=message;
    // Open confirm box
    openConfirmBox.value=true;

    return waitElemtDom("#confirm-box",true) // wait confirm box open
    .then(()=>waitElemtDom("#confirm-box",false)) // wait confirm box close
    .then(()=>useState<boolean>("answerConfirmBox").value); // return answer
}