export { tFile, tProject, tCompound, tMachine};

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
        url:string,
        archive_date:string,
    }
    interface tMachine{
        id:string,
        name:string,
        description:string,
        m_type:"UV"|"FID"|"MZ"|"",
        archive_date:string,
    }
}