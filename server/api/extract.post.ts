
import { writeFileSync, readFileSync, createReadStream} from "fs";
import {tFile} from "~/types/file";
import { sendStream } from 'h3'

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

    console.log(csv);
    return csv;
    
}

export default defineEventHandler(async (event) => {
    const listFiles = await readBody(event) as {files:tFile[], loc: string};

    if (!listFiles){
        return "";
    }
    
    for (const infoFile of listFiles.files){
        const myFile = readFileSync(`/shareFile/${infoFile.id}`)
        const response = await fetch("http://p2m2ToolsApi:8080/p2m2tools/api/format/parse",{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: myFile
        });

        const jsonContent = await response.json();
        
        writeFileSync(`./public/${infoFile.id}.csv`, json2csv(jsonContent));

        return sendStream(event, createReadStream(`./public/${infoFile.id}.csv`));
    }
});