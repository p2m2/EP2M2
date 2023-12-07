<!-- 
    This composant provide part to managa raw file from engine and extract all
    information.
 -->

<script setup lang="ts" >
import { ref, reactive, computed } from "vue";
import type { tFile, tProject } from "../plugins/file";
// import { useI18n, useToast } from "#imports";
const { t } = useI18n();
import { string, minLength, toTrimmed, object, parse } from 'valibot'
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
const toast = useToast()

const labSelectFile = ref<string>("Télécharger le(s) fichier(s)");


const labDeleteRow = ref<string>("supprimer");

const labLoading = ref<string>("Chargement ...");

const isOpen = ref<boolean>(false);
const loading = ref<number>(0);


// Define struct of table of file
// 3 columns (name, type, size in KB, delete actions)
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

// Define of struct of table of project
// 4 columns (name, Creation Date, number file in project, actions)
// In actions we have 3 buttons (export, consult/modify, delete)
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

// Variable to know by which column the project's table sorted
const sortProject = ref<{ column: string; direction: "asc" | "desc"; }>({
    column: "",
    direction: "asc"
})

/**
 * Empty variable (type tProject) passing in parameter
 * @param project 
 */
function emptyProject(project: tProject) {
    project.id = "";
    project.name = "";
    project.createDate = "";
    project.nbFile = 0;
    project.files = [] as tFile[];
}

// The project consulted
const currentProject = reactive<tProject>({
    id: "",
    name: "",
    createDate: "",
    nbFile: 0,
    files: [] as tFile[]
});
// Where new files of project save
let currentFolder: string = "";

/**
 * Get all list of projects of one page and number of page
 * @param team user's team
 * @param orderby sorted colunm
 * @param sort how the column is sorted
 * @param page number page
 */
async function getProjects(team: string = "",
    orderby: string = "",
    sort: string = "",
    page: number = 1): Promise<{ projects: tProject[], count: number }> {

    return await $fetch("api/getProjects", {
        method: "POST",
        body: {
            team: team,
            orderby: orderby,
            sort: sort,
            page: page
        }
    });
}

// Part define variable to show projects's list in table
const projects = reactive<{ projects: tProject[], count: number }>(
    await getProjects("other",
        sortProject.value.column,
        sortProject.value.direction,
        1));
const showProject = computed(() => projects.projects);

async function actualize() {
    await getProjects("other",
        sortProject.value.column,
        sortProject.value.direction,
        1)
    .then((resp) => {
        projects.projects = resp.projects;
        projects.count = resp.count;
    });
}

// Condition part to valid Project name in input 
// and show button to create/modify project
const schema = object({
    name: string([
        toTrimmed(),
        minLength(3, t("message.badProjectName"))
    ]),
})

const validProjectName = computed<boolean>(() => {
    try {
        parse(schema, { name: currentProject.name });
    } catch (error) {
        return false;
    }

    return true;
});

// Define struct of tab of one project
const containProject = [{
    label: "label.files",
    icon: "i-heroicons-document-duplicate"
}, {
    label: "label.templateOperation",
    icon: "i-heroicons-variable"
}
]
const unkeepFiles = [] as tFile[];

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
    formData.append('folder', currentFolder);
    loading.value++;
    $fetch("api/infoFile", {
        method: "post",
        body: formData
    })
        .then((resp) => {
            for (const oneFile of resp as tFile[]) {
                if ((oneFile as tFile).type == "unknown") {
                    unkeepFiles.push(oneFile);
                } else {
                    currentProject.files.push(oneFile);
                }
            }
            if (unkeepFiles.length > 0) {
                toast.add({
                    title: "filchiers non gardé",
                    description: unkeepFiles.map(x => x.name + "\n\r").join("")
                });
            }
        })
        .catch(() => {
            console.log("fail");
        })
        .finally(() => loading.value--)
}


function deleteRow(id: string) {
    // get index of row
    const index = currentProject.files.findIndex((file) => file.id == id);

    // Delete the row 
    if (index != undefined) {
        currentProject.files.splice(index, 1);
    }
}

async function onSubmit(event: FormSubmitEvent<any>) {
    // Do something with data
    // console.log(event.data)
}

async function extract(idProject:string) {
    const response = await $fetch("/api/extract", {
        method: "post",
        body: idProject
    });
    // console.log(response);

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
    currentFolder = crypto.getRandomValues(new Uint32Array(4)).join("-");
    if (id === "") {
        emptyProject(currentProject);
    }
    else {
        const tempProject = showProject.value.filter(p => p.id == id)

        currentProject.id = id;
        currentProject.name = tempProject[0].name;
        currentProject.createDate = tempProject[0].createDate;
        currentProject.nbFile = tempProject[0].nbFile;
        currentProject.files = tempProject[0].files;
    }

    isOpen.value = true;
}

function localDate(rowDate: string): string {
    return (new Date(rowDate)).toLocaleString();
}

const lockProject = ref<boolean>(false);
const msgProgress = ref<string>("");

function waitingProcess(msg: string) {
    lockProject.value = true;
    msgProgress.value = msg;
}

async function processOk(msg: string) {
    isOpen.value = false;
    lockProject.value = false;
    emptyProject(currentProject);
    currentFolder = "";
    toast.add({ title: msg });
    await actualize();
}

function processFail(msg:string){
    lockProject.value = false;
    toast.add({ title: msg });
}
function createProject() {
    const body = new FormData();
    body.append("folder", currentFolder);
    body.append("project", JSON.stringify(currentProject));
    // todo get team name
    body.append("team", "other");
    // todo undisplay modal and waiting popup
    waitingProcess(t("message.waitCreateProject"));
    $fetch("api/createProject", {
        method: "POST",
        body: body
    })
    .then(() => processOk(currentProject.name + " " + t("message.created")))
    .catch(() => processFail(t("message.createdFail")));
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
        <UTooltip :text="t('label.addProject')" :popper="{ placement: 'right' }">
            <UButton class="extractButton w-1/3" @click="openProject('')" icon="i-heroicons-folder-plus" />
        </UTooltip>
    </UContainer>
    <UContainer>
        <UTable v-model:sort="sortProject" :rows="showProject" :columns="tabProjectStruct" id="filesTable" :empty-state="{
            icon: 'i-heroicons-folder',
            label: t('label.noProject')
        }" :loading="loading > 0" :loading-state="{
    icon: 'i-heroicons-arrow-path-20-solid',
    label: labLoading
}">
            <template #createDate-data="{ row }">
                {{ localDate(row.createDate) }}
            </template>
            <template #action-data="{ row }">
                <UButton :title="t('button.exportProject')" icon="i-heroicons-arrow-down-on-square" size="xl" color="green"
                    variant="link" @click="extract(row.id)" :disabled="row.nbFile == 0" />
                <UButton :title="t('button.viewProject')" icon="i-heroicons-pencil" size="xl" color="blue" variant="link"
                    @click="openProject(row.id)" />
                <UButton :title="t('button.deleteProject')" icon="i-heroicons-x-mark" size="xl" color="red" variant="link"
                    @click="deleteRow(row.id)" />
            </template>
        </UTable>
    </UContainer>

    <UProgress v-if="lockProject" animation="elastic" :max="[msgProgress]" />

    <UModal v-model="isOpen" prevent-close :display="!lockProject">
        <UForm :schema="schema" :state="currentProject" class="space-y-4" @submit="onSubmit">
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold
                                leading-6 text-gray-900 
                                dark:text-white">
                            {{ t("title.projectName") }}
                        </h3>
                        <UButton color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="isOpen = false" />
                    </div>
                    <UFormGroup name="name">
                        <UInput v-model="currentProject.name" autofocus requires />
                    </UFormGroup>
                </template>
                <UTabs :items="containProject">
                    <template #default="{ item }">
                        <span class="truncate">
                            {{ t(item.label) }}
                        </span>
                    </template>
                    <template #item="{ item }">
                        <UTooltip v-if="item.label === 'label.files'" :text="t('label.addFile')"
                            :popper="{ placement: 'right' }">
                            <input type="file" id="inFilesSelect" multiple style="display: none;" />
                            <UButton color="white" variant="outline" :title="t('label.addFile')"
                                @click="simulateClick('inFilesSelect')" icon="i-heroicons-document-plus" />

                        </UTooltip>

                        <UTable v-if="item.label === 'label.files'" :rows="currentProject.files" :columns="tabFilesStruct"
                            id="filesTable" :empty-state="{
                                icon: 'i-heroicons-document',
                                label: t('label.noFile')
                            }" :loading="loading > 0" :loading-state="{
    icon: 'i-heroicons-arrow-path-20-solid',
    label: labLoading
}">
                            <template #delete-data="{ row }">
                                <UButton :title="labDeleteRow" icon="i-heroicons-x-mark" size="xl" color="red"
                                    variant="link" @click="deleteRow(row.id)" />
                            </template>
                        </UTable>
                        <div v-else>
                            <p>couxcou</p>
                        </div>
                    </template>
                </UTabs>
                <template #footer v-if="validProjectName">
                    <UButton v-if="currentProject.id != ''" :title="t('button.update')" icon="i-heroicons-arrow-path"
                        :label="t('button.update')" />
                    <UButton v-else :title="t('button.create')" icon="i-heroicons-check-badge" :label="t('button.create')"
                        @click="createProject()" />
                </template>
            </UCard>
        </UForm>
    </UModal>
</template>