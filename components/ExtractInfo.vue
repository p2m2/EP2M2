<!-- 
    This composant provide part to managa raw file from engine and extract all
    information.
 -->

<script setup lang="ts" >
import {ref, reactive} from "vue";
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
    key: "theFile.name",
    label: labTableName.value,
    sortable: true
}, {
    key: "internalType",
    label: labTableType.value,
    sortable: true
}, {
    key: "theFile.size",
    label: labTableSize.value,
    sortable: true
}, {
    key: "delete"
}];

const files = reactive<{theFile:File, internalType:string}[]>([]);

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

    // Add list file in table
    const fileList = (evt?.currentTarget as  HTMLInputElement).files;
    if (fileList) for (const myFile of fileList){
        await getType(myFile);        
    }    
}
    
/**
     * we determinate type of file with P2M2Tool API
     * @param myFile file selected in input
     */
async function getType(myFile: File):Promise<void>{
    const reader = <FileReader> new FileReader();
    let fileType = <string> "Unknwon Type";
    loading.value ++;

    reader.addEventListener("load", async evt => {
        fetch("http://localhost:8080/p2m2tools/api/format/sniffer",{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: evt.target?.result
        })
            .then((response) => {
                return response.json() as Promise<{format:string}>;
            })
            .then((json) => {
                fileType = json.format;
            })
            .catch(console.error)
            .finally(()=>{
                files.push({theFile:myFile,internalType: fileType});
                loading.value --;
            });
    });
    reader.readAsText(myFile);
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
        <UButton class="extractButton sizeBy3" :title="labSelectDir">
            {{labSelectDir}}
        </UButton>
        <UButton class="extractButton sizeBy3" :title="labDeleteAll">
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
            <template #delete-data>
                <UButton :title="labDeleteRow" icon="i-heroicons-x-mark" 
                         size="xl" color="red" variant="ghost"/>
            </template>
        </UTable>

    </UContainer>
    <UContainer>
        <UButton class="extractButton float-right block sizeAlone">
            {{ labExtract }}
        </UButton>
    </UContainer>
</template>