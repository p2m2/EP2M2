export { tFile, tProject };

declare global {
    interface tFile{
        id:string,
        name:string,
        type:string,
        size:number
    }
    interface tProject{
        id:string,
        name:string,
        createDate:string,
        nbFile:number,
        Files:tFile[]|null,
        // TODO: add operation post export
    }
}