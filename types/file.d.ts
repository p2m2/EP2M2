export { tFile };

declare global {
    interface tFile{
        id:string,
        name:string,
        type:string,
        size:number
    }
}