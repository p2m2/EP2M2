// © 2024 INRAE
// SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

export { tFile, tProject, tCompound, tMachine,tFitting};

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
        calibCurves:number[],
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
    interface tFitting{
        id:string,
        id_compound:string,
        id_machine:string,
        date_create:string,
        url_provider:string,
        lot:string,
        rt:number,
        archive_date:string,
    }
}