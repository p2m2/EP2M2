export { tFile, tProject, tCompound };

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
        files:tFile[],
        // TODO: add operation post export
    }
    interface tCompound{
        id:string,
        name:string,
        description:string,
        url:string
    }
}