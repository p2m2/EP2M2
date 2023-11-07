<!-- 
    This composant provide part to managa raw file from engine and extract all
    information.
 -->

<script setup lang="ts" >
import {ref, reactive} from "vue";
import {tFile} from "../types/file"

const labSelectFile = ref<string>("Télécharger le(s) fichier(s)");
const labSelectDir = ref<string>("Télécharger un dossier");
const labDeleteAll = ref<string>("Tout supprimer");

const labTableName = ref<string>("Nom");
const labTableType = ref<string>("Type");
const labTableSize = ref<string>("Taille");
const labDeleteRow = ref<string>("supprimer");
const labExtract = ref<string>("Extraire");
const labNoFiles = ref<string>("Pas de fichier");
const labLoading = ref<string>("Chargement ...");

const loading = ref<number>(0);

const columns = [{
    key: "name",
    label: labTableName.value,
    sortable: true
}, {
    key: "type",
    label: labTableType.value,
    sortable: true
}, {
    key: "size",
    label: labTableSize.value,
    sortable: true
}, {
    key: "delete"
}];

const files = reactive<tFile[]>([]);

// ---- Manage select several files

// Simulate click on input with button
function simulateClick(id:string):void{
    const inputElementFiles = <HTMLInputElement>document.getElementById(id);
        
    // Listen event when user choose files
    inputElementFiles.addEventListener("change",
        evt => getFiles(evt));
                                
    // Click on input
    inputElementFiles.click();
}

/**
     * Get all files from input and show them in table
     * @param evt the event
     */
async function getFiles(evt:Event | null):Promise<void>{
    if (!(evt)){
        return;
    }
    // To don't have two event change
    evt.stopImmediatePropagation();

    const formData = new FormData();

    // Add list file in table
    const fileList = (evt?.currentTarget as  HTMLInputElement).files;
    if (fileList) for (const myFile of fileList){
        formData.append('file', myFile);
    }    
    loading.value ++;
    $fetch("api/infoFile",{method:"post", body:formData})
        .then((resp) => {  
            for(const oneFile of resp as []) {
                files.push(oneFile as tFile);
            }     
        })
        .catch(() => {
            console.log("fail");
            
        })
        .finally(() => loading.value -- )
}

function deleteAll(){
    files.splice(0, files.length)
}

function deleteRow(id:string){
    // get index of row
    const index = files.findIndex((file) => file.id == id);

    // Delete the row 
    if (index != undefined){
        files.splice(index,1);
    }
}

async function extract() {
    const response = await $fetch("/api/extract",{method:"post", body:files});
    console.log(response);
    
    if (response === "" || !response){
        return 0
    }

    const data = new Blob ([response], { type: 'application/zip' });

    // console.log(data.value);

    const eleLink = document.createElement('a');
    eleLink.download = `Extration_${new Date(Date.now()).toISOString()
                                    .replaceAll(/\W/g, "")}.tar`;
    eleLink.style.display = 'none';

    eleLink.href = URL.createObjectURL(data);

    document.body.appendChild(eleLink);
    eleLink.click();

    URL.revokeObjectURL(eleLink.href);
    document.body.removeChild(eleLink);

}
    
defineExpose({
    labSelectFile,
});
    
</script>
    
<style>
    .extractButton {
        background-color: var(--greenP2M2);
        margin: 2px;
        padding: 1rem 2rem 1rem 2rem;
        border: 2px solid var(--blueP2M2);
        color: var(--blueP2M2);
        font-weight: bold;
        transition: all 0.5s ease-out;
        cursor: pointer;
        text-align: center;
        justify-content: center;
    }

    .sizeBy3{
        width: 33%;
    }

    .sizeAlone{
        width: 10%;       
    }

    .extractButton:hover,
    .extractButton:focus {
        background-color: var(--blueP2M2);
        color: var(--greenP2M2);
        border: 2px solid var(--greenP2M2);
    }
</style>

<template>
    <UContainer class="flex justify-around items-center">
        <input type="file" id="inFilesSelect" multiple style="display: none;"/>
        <UButton class="extractButton sizeBy3" :title="labSelectFile"
                 @click="simulateClick('inFilesSelect')">
            {{labSelectFile}}
        </UButton>
        <input type="file" id="inDirSelect" multiple webkitdirectory 
               style="display: none;"/>
        <UButton class="extractButton sizeBy3" :title="labSelectDir"
                 @click="simulateClick('inDirSelect')">
            {{labSelectDir}}
        </UButton>
        <UButton class="extractButton sizeBy3" :title="labDeleteAll"
                 @click="deleteAll()">
            {{labDeleteAll}}
        </UButton>
    </UContainer>
    <UContainer>
        <UTable :rows="files" :columns="columns" id="filesTable"
                :empty-state="{ icon: 'i-heroicons-document-text',
                                label: labNoFiles }" :loading="loading>0"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid',
                                  label: labLoading }"> 
            <!-- TODO manage case unknow type -->
            <template #delete-data="{row}">
                <UButton :title="labDeleteRow" icon="i-heroicons-x-mark" 
                         size="xl" color="red" variant="ghost"
                         @click="deleteRow(row.id)" />
            </template>
        </UTable>

    </UContainer>
    <UContainer v-if="files.length">
        <UButton class="extractButton float-right block sizeAlone"
                 @click="extract()">
            {{ labExtract }}
        </UButton>
    </UContainer>
</template>