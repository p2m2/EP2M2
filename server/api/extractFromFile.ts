// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// This API is used to extract the content of a file , save file in database
// and to return the information about it. The information is id of file in
// database, the name of the file, list of metabolites, and its area. If 
// unknown type of file is detected, the file is not saved in database and 
// returned number. 1 for unknow type of file, 2 for another error. 

import fs from "fs";
import path from "path";
import { P2M2ToolsApi, P2M2ToolsApiFill } from "@/types/p2m2Api";

export default defineEventHandler(async(event) => {
    // Read the form data from the event
    const formData = await readMultipartFormData(event);

    // Get the file from the form data
    if(!formData){
        return 2;
    }

    const rFile = formData[0].data;

    // wrtie the file on disk
    const id = crypto.randomUUID();
    const filePath = path.join("/shareFile", id);
    fs.writeFileSync(filePath, rFile);


    // Send the file to the parser
    return await fetch(
        "http://p2m2ToolsApi:8080/p2m2tools/api/format/parse",{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: fs.readFileSync(filePath),
        })
        .then((resp) => {
            return resp.json() as Promise<P2M2ToolsApi>;
        })
        .then((jsonResp) => {
            // If the file is unknown, delete it
            if(JSON.stringify(jsonResp) === JSON.stringify({})){
                return 1;
            }
            return extractMetabolites(jsonResp as P2M2ToolsApiFill);
        })
        .catch(()=>{
            // If an error occurs, delete the file
            return 2
        })
        .finally(()=>{
            // Delete the file
            fs.rmSync(filePath);
            
        });
   
})


/**
 * We extract name and area of metabolites from the file.
 * @param jsonResp  The response from the parser
 * @returns The list of tupple metabolites and their area
 */
function extractMetabolites(jsonResp: P2M2ToolsApiFill): [string, number][] {
    // Check if the response contains the header and the samples
    if(jsonResp.header && jsonResp.samples){
        // Get the index of the name and the area
        const idxMeta = jsonResp.header.indexOf("metabolite");
        const idxArea = jsonResp.header.indexOf("area");
        // If the name and the area are found, return the list of metabolites 
        // and their area
        if(idxMeta != -1 && idxArea != -1){
           
            const metaArea = jsonResp.samples.filter(x => 
                // keep the metabolite and the area are not empty
                x[idxMeta] !== "" && x[idxArea] !== "" && 
                // keep if the area is a number
                !isNaN(parseFloat(x[idxArea])));

            return metaArea.map(x => [x[idxMeta], parseFloat(x[idxArea])]
            );
        }
    }
    return [];
}
