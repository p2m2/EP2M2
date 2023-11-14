
import { writeFileSync, readFileSync, existsSync, mkdirSync} from "fs";
import {open} from "fs/promises";
import {tFile} from "~/types/file";
import { sendStream } from "h3";
import {join} from "path";


function addJson(jsonFile: JSON, whereAdd: unknown[]):unknown[]{
    // thx : https://stackoverflow.com/a/31536517
    // specify how you want to handle null values here
    const replacer = (_key:string, value:unknown) =>
        value === null ? "" : value; 
    const itemsJson = JSON.parse(JSON.stringify(jsonFile), replacer);
    let items = [];
    if (Array.isArray(itemsJson)){
        items = itemsJson;
    }
    else{
        items = [itemsJson];
    }

    return [...whereAdd, ...items];
}

function toCsv(items: unknown[]):string{
    // thx : https://stackoverflow.com/a/31536517
    const header = [...new Set(items.map((x) => Object.keys(x)).flat())];
    console.log(header);
    
    const sep = ";";

    const csv = [
        header.join(sep), // header row first
        ...items.map((row:{[key: string]:any}) => 
            header.map(fieldName => 
                String(row[fieldName]?row[fieldName]:"")).join(sep))
    ].join("\r\n");

    return csv; 
}


export default defineEventHandler(async (event) => {
    const listFiles = await readBody(event) as tFile[];
    const shareDir = process.env.EP2M2_DIR_SHARE;
    const resultsDir = process.env.EP2M2_DIR_RESULT;
      
    if (!listFiles || !shareDir || !resultsDir){
        return "";
    }
    
    // Create directory to save result  
    const resultFolder = join(resultsDir, crypto.randomUUID());
   
    if (!existsSync(resultFolder)){
        mkdirSync(resultFolder,{recursive:true});
       
    }
    
    let extract: unknown[] = [];

    for (const infoFile of listFiles){
        // Ask extraction 
        const response = await fetch("http://p2m2ToolsApi:8080/p2m2tools/api/format/parse",{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: readFileSync(join(shareDir, infoFile.id))
        });

        // Save extraction
        const jsonContent = await response.json();
        console.log(jsonContent);
        
        extract = addJson(jsonContent, extract);
        console.log(extract);        
    }
    
    // create csv with all resutls
    const resultFile = join(resultsDir, new Date(Date.now()).toISOString())
        .replaceAll(/[^a-zA-Z0-9_\/\\]/g, "") + "result.csv";
    
    writeFileSync(resultFile, toCsv(extract));
   
  
    const csvFile = await open(resultFile);

    return sendStream(event, csvFile.createReadStream());
});