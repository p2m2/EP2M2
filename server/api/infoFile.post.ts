// import fs from "fs";
import { writeFileSync, readFileSync } from "fs";

export default defineEventHandler(async(event):Promise<{id:string, name:string, type:string, size:number}[]| unknown[]>=> {
    const infoFiles: {id:string, name:string, type:string, size:number}[] | unknown[] = [];
    const files = await readMultipartFormData(event);
    
    if(!files){
        return [];
    }
    
    // TODO: transform this part in asynchrone
    for(const myFile of files){
        const id = crypto.randomUUID();
        const filePath = `/shareFile/${id}`;
        writeFileSync(filePath, myFile.data);
        const form = new FormData();
        form.append("file", new File([myFile.data as BlobPart], filePath));

        const response = await fetch("http://p2m2ToolsApi:8080/p2m2tools/api/format/sniffer",{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: readFileSync(filePath),
        });
        
        const jsonResp = await response.json();

        console.log(myFile);
        console.log(myFile.data.length);
        infoFiles.push({
            id: id,
            name: myFile.filename as string,
            type: jsonResp.format,
            size: myFile.data.length
        });

    }

    return infoFiles;


});