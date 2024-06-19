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

export default defineEventHandler(async(event) => {
    // Read the form data from the event
    const formData = await readBody(event);
    // Get the file from the form data
    if(!formData){
        return 2;
    }
   
    // wrtie the file on disk
    const id = crypto.randomUUID();
    const filePath = path.join("/shareFile", id);
    fs.writeFileSync(filePath, formData);


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
            return resp.json() as Promise<{}|{ header : string[], samples : string[][]}>;
        })
        .then((jsonResp) => {
            // If the file is unknown, delete it
            if(JSON.stringify(jsonResp) === JSON.stringify({})){
                return 1;
            }
            return jsonResp;
        })
        .catch(()=>{
            // If an error occurs, delete the file
            return 2
        })
        .finally(()=>{
            // Delete the file
            fs.rmSync(filePath);
            console.log("File deleted");
            
        });

    // console.log(resp);
    
})