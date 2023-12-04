// import fs from "fs";
import { readFileSync, existsSync, mkdirSync} from "fs";
import { writeFile, rm} from "fs/promises";
import path from "path";


function getInfoFiles(
    myFile:MultiPartData,
    dirPath:string,
    infoFiles: {id:string, name:string, type:string, size:number}[] | 
    unknown[] = []) {

    const id = crypto.randomUUID();
    const filePath = path.join(dirPath,id);
    return writeFile(filePath, myFile.data)
        .then(()=>{            
            return fetch(
                "http://p2m2ToolsApi:8080/p2m2tools/api/format/sniffer",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: readFileSync(filePath),
                });
        })
        .then((resp) => {
            return resp.json() as Promise<{format:string}>;
        })
        .then((jsonResp) => {
            if(jsonResp.format == "unknown"){
                rm(filePath);
            }
            return infoFiles.push({
                id: id,
                name: path.basename(myFile.filename as string),
                type: jsonResp.format,
                size: myFile.data.length
            });
        })
        .catch(()=>{        
            rm(filePath);
            console.error("Problem with", myFile.filename);            
            return infoFiles.push({
                id: id,
                name: path.basename(myFile.filename as string),
                type: "unknown",
                size: myFile.data.length
            });
        }); 
    

}

export default defineEventHandler(async(event):
    Promise<{
        infoFiles:{id:string, name:string, type:string, size:number}[]| unknown[], 
        folder:string}>=> {
    const files = await readMultipartFormData(event);
    
    if(!files){
        return {infoFiles:[], folder:""};
    }
    const dirPath = path.join("/shareFile", crypto.randomUUID());
    // thx : https://stackoverflow.com/a/26815894
    if(!existsSync(dirPath)){
        mkdirSync(dirPath,{recursive:true});
    }
    const infoFiles: {id:string, name:string, type:string, size:number}[] | unknown[] = [];

    await Promise.all(files.map(x => getInfoFiles(x, dirPath, infoFiles)));
    
    return {infoFiles:infoFiles, folder:dirPath};


});