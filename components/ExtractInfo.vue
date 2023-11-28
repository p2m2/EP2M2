<!-- 
    This composant provide part to managa raw file from engine and extract all
    information.
 -->

<script setup lang="ts" >
import { ref, reactive, computed } from "vue";
import type { tFile, tProject } from "../types/file";
import { useI18n } from "#imports";
const { t } = useI18n();

const labSelectFile = ref<string>("Télécharger le(s) fichier(s)");


const labDeleteRow = ref<string>("supprimer");

const labLoading = ref<string>("Chargement ...");

const isOpen = ref<boolean>(false);
const loading = ref<number>(0);

const tabFilesStruct = [{
    key: "name",
    label: t("label.tabFileName"),
    sortable: true
}, {
    key: "type",
    label: t("label.tabType"),
    sortable: true
}, {
    key: "size",
    label: t("label.tabSize"),
    sortable: true
}, {
    key: "delete"
}];

const tabProjectStruct = [
    {
        key: "name",
        label: t("label.project"),
        sortable: true
    },
    {
        key: "createDate",
        label: t("label.createDate"),
        sortable: true
    },
    {
        key: "nbFile",
        label: t("label.nbFile"),
        sortable: false
    },
    {
        key: "action"
    }
];

const sortProject = ref({
    column: "",
    direction: ""
})

const files = reactive<tFile[]>([]);
const currentProject = reactive<tProject>({
    id: "",
    name: "",
    createDate: "",
    nbFile: NaN,
    files: null
});

function getProjects(team:string="",
                     orderby:string="",
                     sort:string="",
                     page:number=1){
    let result:tProject[]|undefined= undefined;
    $fetch("api/getProjects",{
        method:"POST",
        body:{
            team:team,
            orderby:orderby,
            sort:sort,
            page:page
        }
    })
    .then((res) =>result = res as tProject[])
    .catch();

    return result;
}

const showProject = computed(() =>
    getProjects("other",
                sortProject.value.column,
                sortProject.value.direction,
                1)
);
const containProject = [{
    label: "label.files",
    icon: "i-heroicons-document-duplicate"
}, {
    label: "label.templateOperation",
    icon: "i-heroicons-variable"
}
]
const showFiles = computed(() => files.filter((x) => x.type != "unknown"));

const unkeepFiles = computed(() => files.filter((x) => x.type == "unknown"));

// ---- Manage select several files

// Simulate click on input with button
function simulateClick(id: string): void {
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
async function getFiles(evt: Event | null): Promise<void> {
    if (!(evt)) {
        return;
    }
    // To don't have two event change
    evt.stopImmediatePropagation();

    const formData = new FormData();

    // Add list file in table
    const fileList = (evt?.currentTarget as HTMLInputElement).files;
    if (fileList) for (const myFile of fileList) {
        formData.append('file', myFile);
    }
    loading.value++;
    $fetch("api/infoFile", { method: "post", body: formData })
        .then((resp) => {
            for (const oneFile of resp as []) {
                files.push(oneFile as tFile);
            }
        })
        .catch(() => {
            console.log("fail");

        })
        .finally(() => loading.value--)
}


function deleteRow(id: string) {
    // get index of row
    const index = files.findIndex((file) => file.id == id);

    // Delete the row 
    if (index != undefined) {
        files.splice(index, 1);
    }
}

async function extract() {
    const response = await $fetch("/api/extract", {
        method: "post",
        body: showFiles.value
    });
    console.log(response);

    if (response === "" || !response) {
        return 0
    }

    const data = new Blob([response], { type: 'text/csv' });

    // console.log(data.value);

    const eleLink = document.createElement('a');
    eleLink.download = `Extration_${new Date(Date.now()).toISOString()
        .replaceAll(/\W/g, "")}.csv`;
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

function openProject(id: string) {

    if (id === "") {
        currentProject.id = "";
        currentProject.name = "";
        currentProject.createDate = "";
        currentProject.nbFile = NaN;
        currentProject.files = null;
    }
    else {
        const tempProject = showProject.filter(p => p.id == id)

        currentProject.id = id;
        currentProject.name = tempProject[0].name;
        currentProject.createDate = tempProject[0].createDate;
        currentProject.nbFile = tempProject[0].nbFile;
        currentProject.files = tempProject[0].files;
    }

    isOpen.value = true;
}

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

.sizeBy3 {
    width: 33%;
}

.sizeAlone {
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
    <UContainer class="flex justify-start items-left">
        <!-- <input type="file" id="inFilesSelect" multiple style="display: none;"/>
        <UButton class="extractButton sizeBy3" :title="labSelectFile"
                 @click="simulateClick('inFilesSelect')">
            {{labSelectFile}}
        </UButton> -->
        <UTooltip :text="t('label.addProject')" :popper="{ placement: 'right' }">
            <UButton class="extractButton w-1/3" @click="openProject('')" icon="i-heroicons-folder-plus" />

        </UTooltip>
    </UContainer>
    <UContainer>
        <UTable 
        v-model:sort="sortProject"
        :rows="showProject" 
        :columns="tabProjectStruct" 
        id="filesTable" 
        :empty-state="{
            icon: 'i-heroicons-folder',
            label: t('label.noProject')
        }" 
        :loading="loading > 0" 
        :loading-state="{
            icon: 'i-heroicons-arrow-path-20-solid',
            label: labLoading
            }"
        >

            <template #action-data="{ row }">
                <UButton :title="t('button.exportProject')" icon="i-heroicons-arrow-down-on-square" size="xl" color="green"
                    variant="ghost" @click="deleteRow(row.id)" />
                <UButton :title="t('button.viewProject')" icon="i-heroicons-pencil" size="xl" color="blue" variant="ghost"
                    @click="openProject(row.id)" />
                <UButton :title="t('button.deleteProject')" icon="i-heroicons-x-mark" size="xl" color="red" variant="ghost"
                    @click="deleteRow(row.id)" />
            </template>
        </UTable>
    </UContainer>

    <UModal v-model="isOpen" prevent-close>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        {{ t("title.projectName") }}
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                        @click="isOpen = false" />
                </div>
                <UInput v-model="currentProject.name" />
            </template>
            <UTabs :items="containProject">
                <template #default="{ item }">
                    <span class="truncate">
                        {{ t(item.label) }}
                    </span>

                </template>
                <template #item="{ item }">
                    <UTable v-if="item.label === 'label.files'" :rows="showFiles" :columns="tabFilesStruct" id="filesTable"
                        :empty-state="{
                            icon: 'i-heroicons-document',
                            label: t('label.noFile')
                        }" :loading="loading > 0" :loading-state="{
    icon: 'i-heroicons-arrow-path-20-solid',
    label: labLoading
}">

                        <template #delete-data="{ row }">
                            <UButton :title="labDeleteRow" icon="i-heroicons-x-mark" size="xl" color="red" variant="ghost"
                                @click="deleteRow(row.id)" />
                        </template>
                    </UTable>
                    <div v-else>
                        <p>couxcou</p>
                    </div>
                </template>
            </UTabs>
            <template #footer v-if="currentProject.name != ''">
                <UButton v-if="currentProject.id != ''" 
                    :title="t('button.update')"
                    icon="i-heroicons-arrow-path"
                    :label="t('button.update')"/>
                <UButton v-else :title="t('button.create')"
                    icon="i-heroicons-check-badge"
                    :label="t('button.create')"/>
            </template>
        </UCard>
    </UModal>
</template>