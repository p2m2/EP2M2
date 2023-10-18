
import { writeFileSync, readFileSync, createReadStream, existsSync,
         mkdirSync} from "fs";
import {open} from "fs/promises"
import {tFile} from "~/types/file";
import { sendStream } from 'h3';
import {join} from "path";
import {execSync} from "child_process"

function json2csv(jsonFile: JSON):string{
    // thx : https://stackoverflow.com/a/31536517
    // specify how you want to handle null values here
    const replacer = (_key:string, value:any) => value === null ? "" : value; 
    const itemsJson = JSON.parse(JSON.stringify(jsonFile), replacer);
    let items = [];
    if (Array.isArray(itemsJson)){
        items = itemsJson;
    }
    else{
        items = [itemsJson];
    }
    const header = Object.keys(items[0]);
    const csv = [
        header.join(","), // header row first
        ...items.map((row:{[key: string]:any}) => header.map(fieldName => String(row[fieldName]?row[fieldName]:"")).join(","))
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
        
        const resultFile = infoFile.name.substring(0,
                                                   infoFile.name.indexOf("."));



        writeFileSync(join(resultFolder, `${resultFile}.csv`), 
                      json2csv(jsonContent));
    }

    // create archive with all resutls
    const resultFile = join(resultsDir, new Date(Date.now()).toISOString())
                            .replaceAll(/[^a-zA-Z0-9_\/\\]/g, "") + ".tar";
    console.log(resultFile);
    
    // TODO Add error manage
    execSync(`find ${resultFolder} -maxdepth 1 -printf "%P\n" \
              |tar cf ${resultFile} -C ${resultFolder} -T -`);
   
    console.log("next");
    
    const zipFile = await open(resultFile);
    console.log("suite")
    return sendStream(event, zipFile.createReadStream());
});