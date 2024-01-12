import pg from "pg";

export default class Table {
    _headers: { key: string; type: string; sortable:boolean; }[] = [];
    _nameTable!: string;
    constructor(nameTable:string) {
        const client = new pg.Client();
        // thx: https://stackoverflow.com/a/50885340
        return (async():Promise<Table> => {
            await client.connect();
            // TODO work with wiew SQL
            const resp:{rows:{column_name:string, data_type:string}[]} = await client.query(`
                              SELECT column_name, data_type
                              FROM information_schema.columns
                              WHERE table_name='${nameTable}';
                        `);
            
            if (resp.rows.length == 0){
                client.end();
                throw new Error(`${nameTable} table doesn't exist`);
            }

            for(const row of resp.rows as {column_name:string, data_type:string}[]){
                this._headers.push({
                    key: row.column_name, 
                    type: row.data_type,
                    sortable: true
                });
            }

            this._nameTable = nameTable;
            client.end();
            return this;
        })()as unknown as Table;

    }

    /**
     * Get all headers of table 
     * @returns array for structure of table of vuetify
     */
    get header(){
        return this._headers.filter(x => x.key != "id");
    }

    async totalItems(): Promise<number>{
        const client = new pg.Client();
        await client.connect();
        // get number of rows
        // TODO add id in all table or use sql properties to get nb rows
        const resp = await client.query(`SELECT COUNT(*) as nb_rows
                                   FROM ${this._nameTable}`);
        
        client.end();
        return resp.rows[0].nb_rows;
    }
    /**
     * Get number of page of Table
     * @param nbRowsByPage number : number of rows by page
     * @returns number
     */
    async getNbPage(nbRowsByPage: number){
        const nbRows = this.totalItems;

        return Math.floor(nbRows/nbRowsByPage) +
            (nbRows%nbRowsByPage?1:0);
    }

    /**
     * Get rows of a page
     * @param numberPage : number: number of page
     * @param nbRowsByPage : number: number of rows by page
     * @param sorts :key:string, order: "ASC"|"DESC"}[]: sort of table
     * @returns : Object[] : rows
     */
    async getPage(numberPage: number,
        nbRowsByPage: number,
        sorts: {key:string, order: "asc"|"desc"}[]|[] = [] ){
        
        let query = "SELECT * "; 

        query += ` FROM ${this._nameTable} `;

        // create part query of ORDER BY
        const orderBy = [];
        for (const sort of sorts){
            orderBy.push(sort.key + " " + sort.order);
        }

        if(orderBy.length > 0){
            query += "ORDER BY " + orderBy.join(",") + " ";
        }

        // part query: choose a part of rows
        query += `LIMIT ${nbRowsByPage} 
                  OFFSET ${nbRowsByPage * (numberPage-1)};`;
        
        const client = new pg.Client();
        await client.connect();
        const resp = await client.query(query);
        client.end();
        return resp.rows;
    }

    /**
     * Get rows about filters
     * @param wheres :{string:number|string}[]
     * @returns :Object[]: rows
     */
    async getRows(wheres:object){
        const client = new pg.Client();
        await client.connect();

        let query = `SELECT * FROM ${this._nameTable} WHERE `;

        // create WHERE part of query
        const where:string[] = [];
        for(const whereKey in wheres){
            where.push(`${whereKey}='${(wheres as never)[whereKey]}'`);
        }

        if (where.length > 0){
            query += where.join(" AND ");
        }

        query += ";";

        const resp = await client.query(query);
        client.end();
        return resp.rows;
    }

    /**
     * Add elements in table
     * @param items: {[columnName:string]:string|number}[]: list of element like that
     * [{column0:value0a, column1:value1a}, {column0:value0b, column1:value1b}]
     * @returns list of ids
     */
    async add(items:[{[columnName:string]:string|number}]){
        const valueOrEmpty = ((x: string|number|undefined) => 
            x?x.toString():"");

        const columns = this._headers.map(x => x.key).filter(x => 
            x!= "id" && x!= "archive_date");

        let query = `INSERT INTO ${this._nameTable} 
                       (${columns.join(",")}) VALUES `;
        
        if(items.length < 1){
            return null;
        }

        const values = [];
        for(const item of items ){
            values.push("('" + columns.map(x => 
                valueOrEmpty(item[x])).join("','") + "')");
        }

        query += values.join(",") + ";";

        const client = new pg.Client();
        await client.connect();
        const resp = await client.query(query);
        client.end();
        return resp.rows;
    }

    /**
     * Modify a element of table
     * @param id : number: id of element
     * @param columns : {[columnName:string]:string|number} :updated part 
     */
    async update(id:number, columns:{[columnName:string]:string|number}) {

        let query = `UPDATE ${this._nameTable} SET `;

        for(const column in columns){
            if(columns[column]){
                query += column + "='" + columns[column] +"',";
            }
            else{
                query += column + "='',";
            }  
        }
       
        // delete last ,
        query = query.slice(0,-1);

        query +=  ` WHERE id = ${id} `;

        console.log(query);
        
        const client = new pg.Client();
        await client.connect();
        await client.query(query);
        client.end();
    }

    /**
     * Delete a element of table
     * @param id :number: id of element
     */
    async del(id:number){
        const client = new pg.Client();
        await client.connect();
        await client.query(`DELETE FROM ${this._nameTable} WHERE id=${id}`);
        client.end();
    }
}