import pg from "pg";

function exportFile(addressFile: {
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

export default defineEventHandler(async (event) => {
    const client = new pg.Client();
    return client.connect()
        .then(() => readBody(event))
        .then((idProject: string) => {
            return client.query(`SELECT content, f_size, f_type
                                 FROM file
                                 WHERE id_project = '${idProject}'`);
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
        .then((resps: any) => {
            let temp = [resps[0].header];
            for(const resp of resps){
                temp = [...temp, ...resp.samples];
            }
            console.log(temp);
            
            return temp.map(x => x.join(";")).join("\r\n");
        })
        .then((csv:string) => {
            const csvBlob = new Blob([csv]);
            return sendStream(event, csvBlob.stream());
        });
});