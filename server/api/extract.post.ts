// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

import pg from "pg";

async function exportFile(addressFile: {
    content: string,
    f_size: number,
    f_type: string
}, client: unknown): Promise<JSON> {
    return client.query(`SELECT lo_get(${addressFile.content}, 0, 
                                       ${addressFile.f_size}) as file`)
        .then((respQuery: { rows: { file: string }[] }) => {
            return fetch("http://p2m2ToolsApi:8080/p2m2tools/api/format/parse/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: respQuery.rows[0].file
                });
        })
        .catch((err: string) => {
            throw new Error("oid" + addressFile.content + err);
        });
}

/**
 * Calculate area of metabolite about series
 * 
 * @param sample one sample
 * @param lMolRatio list of ratio of metabolite associate to project
 * @param indexMeta index of name of metabolite in sample
 * @param indexArea index of area in sample
 */
function CalculateArea(sample: string[], lMolRatio: { [key: string]: number }, indexMeta:number, indexArea:number): string[] {    
    const tempSample = sample;
    // no metabolites in series associate of project 
    if(lMolRatio[tempSample[indexMeta]] === undefined){
        return [...tempSample, "0"];
    }
    // calculate area
    tempSample.push((parseFloat(tempSample[indexArea]) * lMolRatio[tempSample[indexMeta]]).toString());  

    return tempSample;
}

async function GetRatio(client: unknown, idProject: string): 
    Promise<{[key:string]:number}> {
    // get all series of project
    return client.query(`SELECT id_series
                         FROM proj_series
                         WHERE id_project = ${idProject}`)
        .then((respQuery: { rows: { id_series: string }[] }) => {
            if (respQuery.rows.length === 0) {
                throw new Error("No associated series");
            }           
            
            const idSeries = respQuery.rows.map(x => x.id_series);
            // get all metabolite of series
            return client.query(`
                SELECT id_mol, ratio
                FROM ratio
                WHERE id_series IN (${idSeries.join(",")})`
            );
        })
        .then((respQuery: { rows: { id_mol: string, ratio: number }[] }) => {
            
            if (respQuery.rows.length === 0) {
                throw new Error("No ratio");
            }
            // associate one metabolite to one ratio
            const lMolRatio:{[key:string]:number} = {};
            for (const row of respQuery.rows) {
                lMolRatio[row.id_mol] = row.ratio;
            }
            
            return lMolRatio;
        })
        .catch(() => {return {};});
}
export default defineEventHandler(async (event) => {
    const client = new pg.Client();
    let idProject: string;
    return client.connect()
        .then(() => readBody(event))
        .then((body: string) => {
            idProject = body;
            return client.query(`SELECT content, f_size, f_type
                                 FROM view_proj_file
                                 WHERE id_project = '${body}'`);
        })
        .then((respQuery: {
            rows: {
                content: string,
                f_size: number,
                f_type: string
            }[]
        }) => {
            if (respQuery.rows.length === 0) {
                throw new Error("No files");
            }
            return Promise.all(respQuery.rows.map(x => exportFile(x, client)));
        })
        .then((resp: any[]) => Promise.all(resp.map((x: { json: () => any; }) => x.json())))
        .then(async (resps: any) => {
            // function to calculate area do nothing
            let funcCalcul = (x: any) => x;
            let temp = [resps[0].header];
            const lMolRatio = await GetRatio(client, idProject);
            // verify if we have series
            if (Object.keys(lMolRatio).length != 0) {
                // affect function to calculate area
                funcCalcul = (x: any) => CalculateArea(x, 
                                        lMolRatio,
                                        resps[0].header.indexOf("metabolite"),
                                        resps[0].header.indexOf("area"));
                // add header for calculated area
                temp = [[...resps[0].header, "CalculatedArea"]];                
            }
            // calculate area for all samples                        
            for(const sample of resps[0].samples){
                                
                temp.push(funcCalcul(sample));
            }
            
            return temp.map(x => x.join(";")).join("\r\n");
        })
        .then((csv:string) => {
            const csvBlob = new Blob([csv]);
            return sendStream(event, csvBlob.stream());
        })
        .finally(() => client.end());
});