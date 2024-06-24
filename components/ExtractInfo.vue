<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
    This composant provide part to managa raw file from engine and extract all
    information.
 -->

<script setup lang="ts" >
import { ref, reactive, computed } from "vue";
import type { tFile, tProject } from "../plugins/file";
// import { useI18n, useToast } from "#imports";
const { t } = useI18n();
import * as v from 'valibot'
import type {FormError, FormSubmitEvent } from "#ui/types";
import {useCookie } from "nuxt/app";
const toast = useToast()


const isOpen = ref<boolean>(false);
const loading = ref<number>(0);
const stateConfBox = ref<string>("");
const openConfBox = ref<boolean>(false);

const rfAllSeries = ref<{id:string, name:string}[]>([]);

// Define struct of table of file
// 3 columns (name, type, size in KB, delete actions)
const tabFilesStruct = [{
    key: "name",
    title: t("label.tabFileName"),
    sortable: true
}, {
    key: "type",
    title: t("label.tabType"),
    sortable: true
}, {
    key: "size",
    title: t("label.tabSize"),
    sortable: true
}, {
    key: "delete",
    sortable: false
}];

// Define of struct of table of project
// 4 columns (name, Creation Date, number file in project, actions)
// In actions we have 3 buttons (export, consult/modify, delete)
const tabProjectStruct = [
    {
        key: "name",
        title: t("label.project"),
        sortable: true
    },
    {
        key: "createDate",
        title: t("label.createDate"),
        sortable: true
    },
    {
        key: "nbFile",
        title: t("label.nbFile"),
        sortable: false
    },
    {
        key: "action",
        sortable: false
    }
];

const itemsPerPage = ref<number>(5);

// Variable to know by which column the project's table sorted
const sortProject = ref<{
    column: "name"|"createDate",
    direction: "asc" | "desc" }>({
    column: "createDate",
    direction: "desc"
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
    files: [] as tFile[],
    series: []
});
// old version of consulted project
const oldProject = reactive<tProject>({
    id: "",
    name: "",
    createDate: "",
    nbFile: 0,
    files: [] as tFile[],
    series: []
});
// Where new files of project save
let currentFolder: string = "";

// Check if consulted project was modified
const modifiedProject = computed<boolean>(() =>
    // thx: https://stackoverflow.com/a/1144249
    JSON.stringify(currentProject) != JSON.stringify(oldProject));

// record modification of project
const recordModif = {
    name:computed<string>(() =>
        (modifiedProject && oldProject.name != currentProject.name)?
            currentProject.name : ""
    ),
    add:[""], del: [""]
};

const currentPage = ref<number>(1);

/**
 * Get all list of projects of one page and number of page
 * @param page number page
 */
async function getProjects(page: number = 1): Promise<{
    projects: tProject[], count: number
}> {
    return await $fetch("/api/manageControl/rows",{
        method: "POST",
        body:{
            nameTable: "series",
            wheres:{1:1}
        }
    })
    .then((rowsSeries)=>{
        // return id and name of series
        let series = [];
        for (const row of rowsSeries){
            series.push({id: row.id, name: row.name});
        }
        rfAllSeries.value = series;
    })
    .then(() =>{
        return $fetch("/api/getProjects", {
            method: "POST",
            body: {
                team: useCookie("team", { sameSite: "strict" }).value,
                orderBy: sortProject.value.column,
                sort: sortProject.value.direction,
                page: page
            }
        })
    });
}

// Part define variable to show projects's list in table
const projects = reactive<{ projects: tProject[], count: number }>(
    await getProjects());
const showProject = computed(() => projects.projects);

async function actualize({page, itemsPerPage, sortBy }) {
    loading.value ++;
    if(sortBy.length){    
        sortProject.value.column = sortBy[0].key;
        sortProject.value.direction = sortBy[0].order;
    }
    
    await getProjects(page)
        .then((resp) => {
            projects.projects = resp.projects;
            projects.count = resp.count;
        });    

    currentPage.value = page;
    loading.value --;
}

// Condition part to valid Project name in input 
// and show button to create/modify project
const schema = v.pipe(v.string(), v.trim(),
               v.minLength(3, t("message.badProjectName")));
// Function to check if project name is correct
const validate = (state: any): FormError[] => {
    const errors = [];
    try {
        v.parse(schema, state.name);
    } catch (e: unknown) {
        errors.push({
            path: "name",
            message: (e as v.ValiError<typeof schema>).message
        });
    }
    return errors;
}

const validProjectName = computed<boolean>(() => {
    try {
        v.parse(schema, currentProject.name);
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
    label: "label.Series",
    icon: "i-heroicons-variable"
}
]


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
     * Copy file temporaly on server
     * @param evt the event
     */
async function getFiles(evt: Event | null): Promise<void> {

    if (!(evt)) {
        return;
    }

    // To don't have two event change
    evt.stopImmediatePropagation();

    const formData = new FormData();

    // Get file from client
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
            const unkeepFiles = [] as tFile[];
            
            for (const oneFile of resp as tFile[]) {
                if ((oneFile as tFile).type == "unknown") {
                    unkeepFiles.push(oneFile);
                } else {
                    currentProject.files.push(oneFile);
                    // save modification when update project
                    if(currentProject.id != ""){
                        recordModif.add.push(oneFile.id);
                    } 
                }
            }
            // Show unkept files
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
        // update modification
        if(currentProject.id != ""){
            // delete new file
            recordModif.add = recordModif.add.filter(x => x != id);
            // delete file yet save in project
            /^[0-9]+$/.test(id)?recordModif.del.push(id):"";
        }
    }
}

async function onSubmit(event: FormSubmitEvent<any>) {
    // Do something with data
    // console.log(event.data)
}

async function extract(idProject: string) {
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

function openProject(id: string) {
    currentFolder = crypto.getRandomValues(new Uint32Array(4)).join("-");

        emptyProject(currentProject);
        emptyProject(oldProject);

    if (id != "") {
        // reset of record
        recordModif.add=[""];
        recordModif.del=[""];
        const tempProject = showProject.value.filter(p => p.id == id)

        currentProject.id = id;
        currentProject.name = tempProject[0].name;
        currentProject.createDate = tempProject[0].createDate;
        currentProject.nbFile = tempProject[0].nbFile;
        Object.assign(currentProject.files, tempProject[0].files);
        oldProject.id = id;
        oldProject.name = tempProject[0].name;
        oldProject.createDate = tempProject[0].createDate;
        oldProject.nbFile = tempProject[0].nbFile;
        Object.assign(oldProject.files, tempProject[0].files);
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
    await actualize({page:1, itemsPerPage:5, sortBy:[{key:sortProject.value.column, order:sortProject.value.direction}]});
}

function processFail(msg: string) {
    lockProject.value = false;
    toast.add({ title: msg });
}
function createProject() {
    const body = new FormData();
    body.append("folder", currentFolder);
    body.append("project", JSON.stringify(currentProject));
    // todo get team name
    body.append("team", useCookie("team").value as string);
    // todo undisplay modal and waiting popup
    waitingProcess(t("message.waitCreateProject"));
    $fetch("api/createProject", {
        method: "POST",
        body: body
    })
        .then(() => processOk(currentProject.name + " " + t("message.created")))
        .catch(() => processFail(t("message.createdFail")));
}

async function updateProject(){
    waitingProcess(t("message.updateInProgress"));

    const holdOn = [];

    const addListId = recordModif.add.filter(id => id != "");
    if(addListId.length>0){
        const addList = currentProject.files.filter(file => 
            addListId.includes(file.id));
        holdOn.push ($fetch("/api/addFile",{
            method:"POST",
            body:{
                files: addList,
                folder: currentFolder,
                id_project: currentProject.id
            }
        }))
    }

    const delListId = recordModif.del.filter(id => id !="" );
    if (delListId.length>0){
        holdOn.push($fetch("/api/delFile",{method:"POST",body: delListId}));
    }

    if(recordModif.name.value != ""){
        holdOn.push($fetch("/api/changeNameProject",{
            method:"POST",
            body: {
                id: currentProject.id,
                name: recordModif.name.value
            }
        }));
    }

    Promise.all(holdOn)
    .then(() => processOk(currentProject.name + " " + 
                          t("message.updateProject")))
    .catch(() => processFail(t("message.updateFail")));    
}



function changeProjectPage(page){
    actualize({page:page, itemsPerPage:undefined, sortBy:{undefined}});
}


/**
 * Wait a element display in DOM
 * @param selector 
 * @param adding true: wait adding element in Dow; false: wait removing in Dom
 */
// thx https://stackoverflow.com/a/61511955
function waitForElm(selector:string, adding:boolean = true) {
    return new Promise(resolve => {
        if (document.querySelector(selector) && adding) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if(adding){
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            } else {
                if (document.querySelector(selector) == null) {
                    observer.disconnect();
                    resolve(0);
                }
            }
            
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

/**
 * function to manage confirmation box
 * @param msg 
 */
async function confBox(msg: string):Promise<boolean> {

    openConfBox.value = true;
    await waitForElm("#confirMsgId");
    
    const confMsg = document.getElementById("confirMsgId");
    if(confMsg){
        confMsg.textContent = msg;
    }

    await waitForElm("#confirMsgId", false);
    
    if(stateConfBox.value == "yes"){
        stateConfBox.value =""       
        return true;
    }else{
        stateConfBox.value =""       
        return false;
    }
}

/**
 * Manage the close windows of project
 */
async function closeWinProject(){
    
    if((validProjectName.value && currentProject.id =="")
       || (modifiedProject.value)){
        isOpen.value = !await confBox(t("message.confLoseModif"));
    }else{
        isOpen.value = false;
    }
}

async function deleteProject(id:string, name:string){
    if(!await confBox(t("message.confDelProject"))){
        return
    }
    loading.value ++;
    fetch("/api/delProject",{
        method: "POST",
        body: id
    })
    .then(() => toast.add({
                    title: t("message.okDelProject"),
                    description: name
                }))
    .catch(() => toast.add({
                    title: t("message.koDelProject"),
                    description: name
                }))
    .finally(() => {
        loading.value --;
        actualize({page:1, itemsPerPage:5,
                   sortBy:[{
                        key:sortProject.value.column,
                        order:sortProject.value.direction
                    }]});
    })
}

</script>
    
<template>
    <UContainer class="flex justify-start items-left">
        <UTooltip :text="t('label.addProject')" :popper="{ placement: 'right' }">
            <UButton @click="openProject('')" icon="i-heroicons-folder-plus" />
        </UTooltip>
    </UContainer>
    <UContainer>
        <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="tabProjectStruct"
            :items-length="projects.projects.length"
            :items="projects.projects"
            :loading="loading > 0"
            item-value="name"
            @update:options="actualize"
            @update:page="getProjects"
        >
            <template v-slot:headers="{ 
                columns, isSorted, getSortIcon, toggleSort }"
            >
                <tr>
                    <template v-for="column in columns" :key="column.key">
                        <td>
                            <div class="cursor-pointer flex items-center" @click="() => toggleSort(column)">
                                {{ column.title }}
                                <UIcon v-if="column.sortable"
                                    :name=" !isSorted(column)?
                                    'i-heroicons-arrows-up-down-20-solid' :
                                    getSortIcon(column) == '$sortAsc'?
                                    'i-heroicons-bars-arrow-up-20-solid' :
                                    'i-heroicons-bars-arrow-down-20-solid'"
                                    class="w-5 h-5 m-1.5 min-w-[20px]"
                                />
                            </div>
                        </td>
                    </template>
                </tr>
            </template>
            <template v-slot:item.createDate="{ value }">
               {{ localDate(value) }}
            </template>
            <template v-slot:item.action="{ item }">
               <UButton :title="t('button.exportProject')" icon="i-heroicons-arrow-down-on-square" size="xl" color="green"
                    variant="link" @click="extract(item.id)" :disabled="item.nbFile == 0" />
                <UButton :title="t('button.viewProject')" icon="i-heroicons-pencil" size="xl" color="blue" variant="link"
                    @click="openProject(item.id)" />
                <UButton :title="t('button.deleteProject')" icon="i-heroicons-x-mark" size="xl" color="red" variant="link"
                    @click="deleteProject(item.id, item.name)" />
            </template>
            <template v-slot:bottom>
                <div class="text-center pt-2">
                    <v-pagination 
                        v-model="currentPage"
                        :length="projects.count"
                        :total-visible="4"
                        @update:modelValue="changeProjectPage"
                    />
                </div>
            </template>
        </v-data-table-server>
    </UContainer>
    <v-progress-linear
        :active="lockProject"
        :indeterminate="true"
        absolute
        bottom
        color="deep-purple-accent-4"
    >
        {{ msgProgress }}
    </v-progress-linear>

    <!-- Details / create / modification project box -->
    <UModal 
        v-model="isOpen" 
        prevent-close 
        :display="!lockProject">
        <UForm
            :validate="validate"
            :state="currentProject"
            class="space-y-4"
            @submit="onSubmit"
        >
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold
                                leading-6 text-gray-900">
                            {{ t("title.projectName") }}
                        </h3>
                        <UButton color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="closeWinProject()" />
                    </div>
                    <UFormGroup name="name">
                        <UInput v-model="currentProject.name" autofocus requires />
                    </UFormGroup>
                </template>
                <UTabs :items="containProject">
                    <template #default="{ item }">
                        <span class="truncate dark:text-primary">
                            {{ t(item.label) }}
                        </span>
                    </template>
                    <template #item="{ item }">
                        <UTooltip v-if="item.label === 'label.files'" :text="t('label.addFile')"
                            :popper="{ placement: 'right' }">
                            <input type="file" id="inFilesSelect" multiple style="display: none;" />
                            <UButton variant="outline" :title="t('label.addFile')"
                                @click="simulateClick('inFilesSelect')" icon="i-heroicons-document-plus" />

                        </UTooltip>
                        <v-data-table v-if="item.label === 'label.files'"
                            v-model:items-per-page="itemsPerPage"
                            :headers="tabFilesStruct"
                            :items-length="currentProject.files.length"
                            :items="currentProject.files"
                            :loading="loading > 0"
                            item-value="name"
                        >
                            <template v-slot:headers="{ 
                                columns, isSorted, getSortIcon, toggleSort }"
                            >
                                <tr>
                                    <template 
                                        v-for="column in columns" 
                                        :key="column.key"
                                    >
                                        <td>
                                            <div 
                                                class="cursor-pointer flex items-center" 
                                                @click="() => toggleSort(column)"
                                            >
                                                {{ column.title }}
                                                <UIcon v-if="column.sortable"
                                                    :name=" !isSorted(column)?
                                                    'i-heroicons-arrows-up-down-20-solid' :
                                                    getSortIcon(column) == '$sortAsc'?
                                                    'i-heroicons-bars-arrow-up-20-solid' :
                                                    'i-heroicons-bars-arrow-down-20-solid'"
                                                    class="w-5 h-5 m-1.5 min-w-[20px]"
                                                />
                                            </div>
                                        </td>
                                    </template>
                                </tr>
                            </template>
                            <template v-slot:item.delete="{ item }">
                                <UButton 
                                    :title="t('button.deleteRow')" 
                                    icon="i-heroicons-x-mark"
                                    size="xl" color="red"
                                    variant="link"
                                    @click="deleteRow(item.id)" 
                                />
                            </template>
                        </v-data-table>
                        <div v-else>
                            <v-select
                                v-model="currentProject.series"
                                :items="rfAllSeries"
                                item-title="name"
                                item-value="id"
                                label="t('label.selectSerie')"
                            />
                        </div>
                    </template>
                </UTabs>
                <template #footer v-if="validProjectName">
                    <UButton v-if="currentProject.id != '' && modifiedProject"
                        :title="t('button.update')"
                        icon="i-heroicons-arrow-path"
                        :label="t('button.update')"
                        @click="updateProject()"
                    />
                    <UButton v-if="currentProject.id == ''"
                        :title="t('button.create')"
                        icon="i-heroicons-check-badge"
                        :label="t('button.create')"
                        @click="createProject()"
                    />
                </template>
            </UCard>
        </UForm>
    </UModal>

    <!-- Confirmation dialog box -->
    <v-dialog
      v-model="openConfBox"
      width="auto"
    >
        <v-card>
            <v-card-text>
                <p id="confirMsgId"></p>
                <br/>
                <p>{{ t("message.confQuestion") }}</p>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="openConfBox=false; stateConfBox='yes'">
                    {{ t("button.yes") }}
                </v-btn>
                <v-btn color="primary" @click="openConfBox=false">
                    {{ t("button.no") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>