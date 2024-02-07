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
const { t } = useI18n();
import { string, minLength, toTrimmed, object, parse } from 'valibot'
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import {useCookie } from "nuxt/app";
const toast = useToast()

// close / open box of project
const isOpen = ref<boolean>(false);
// loading status of project's table
const loading = ref<number>(0);
// result of confirmation box
const stateConfBox = ref<string>("");
// close / open confirmation box
const openConfBox = ref<boolean>(false);

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
// Number ligne by page in tables
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
    files: [] as tFile[]
});
// old version of consulted project
const oldProject = reactive<tProject>({
    id: "",
    name: "",
    createDate: "",
    nbFile: 0,
    files: [] as tFile[]
});
// Where new files of project save
let currentFolder: string = "";

// Check if consulted project was modified
const modifiedProject = computed<boolean>(() =>
    // thx: https://stackoverflow.com/a/1144249
    JSON.stringify(currentProject) != JSON.stringify(oldProject));

// record modification of project
const recordModif = {
    // automatic record new name
    name:computed<string>(() =>
        (modifiedProject && oldProject.name != currentProject.name)?
            currentProject.name : ""
    ),
    add:[""], del: [""]
};
// Page of table, init at first page
const currentPage = ref<number>(1);

/**
 * Get all list of projects of one page and number of page
 * @param page number page we want have
 */
async function getProjects(page: number = 1): Promise<{
    projects: tProject[], count: number
}> {
    return await $fetch("/api/getProjects", {
        method: "POST",
        body: {
            team: useCookie("team", { sameSite: "strict" }).value,
            orderBy: sortProject.value.column,
            sort: sortProject.value.direction,
            page: page
        }
    });
}

// Part define variable to show projects's list in table
const projects = reactive<{ projects: tProject[], count: number }>(
    await getProjects());
// list of showed projects
const showProject = computed(() => projects.projects);

/**
 * Actulaze the list of projects
 * @param param0 {page:number, itemsPerPage:number, sortBy:[{key:string,
 *                                                           order:string}]}
 */
async function actualize({page, itemsPerPage, sortBy }) {
    // Table become mode loading
    loading.value ++;
    // check if we have a sort
    if(sortBy.length){    
        // take first sort
        sortProject.value.column = sortBy[0].key;
        sortProject.value.direction = sortBy[0].order;
    }
    // get list of projects
    await getProjects(page)
        .then((resp) => {
            // update project list
            projects.projects = resp.projects;
            projects.count = resp.count;
        });    
    // Indicate which page we are choose
    currentPage.value = page;
    // Stop loading of table
    loading.value --;
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
        // add file 
        formData.append('file', myFile);
    }
    // give name of directory where save temporaly file
    formData.append('folder', currentFolder);
    // loading table
    loading.value++;
    // Ask server type of files
    $fetch("api/infoFile", {
        method: "post",
        body: formData
    })
        .then((resp) => {
            const unkeepFiles = [] as tFile[];
            
            for (const oneFile of resp as tFile[]) {
                if ((oneFile as tFile).type == "unknown") {
                    // Create list of unkeept file
                    unkeepFiles.push(oneFile);
                } else {
                    // add file
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
        // stop loading
        .finally(() => loading.value--)
}

/**
 * Delete one file of project
 * @param id id of file
 */
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

/**
 * export in one csv all elements extract from analyzes of the project
 * @param idProject id of project
 */
async function extract(idProject: string) {
    // Ask server csv file
    const response = await $fetch("/api/extract", {
        method: "post",
        body: idProject
    });
    // console.log(response);

    if (response === "" || !response) {
        return 0
    }
    // Create binary csv file
    const data = new Blob([response], { type: 'text/csv' });

    // console.log(data.value);
    // Create a link on page web
    const eleLink = document.createElement('a');
    // Named the file to download
    eleLink.download = `Extration_${new Date(Date.now()).toISOString()
        .replaceAll(/\W/g, "")}.csv`;
    // Hide the link
    eleLink.style.display = 'none';
    // Add in link the binary file
    eleLink.href = URL.createObjectURL(data);
    // Add link in DOM
    document.body.appendChild(eleLink);
    // Click on link
    eleLink.click();
    // Delete URL
    URL.revokeObjectURL(eleLink.href);
    // Delete the link
    document.body.removeChild(eleLink);

}

/**
 * Initialize all variable to manage a project
 * Open box (overlay) of project
 * @param id:string identify of project
 */
function openProject(id: string) {
    // random name of folder for tempory files
    currentFolder = crypto.getRandomValues(new Uint32Array(4)).join("-");
        // empty variable to manage history of project
        emptyProject(currentProject);
        emptyProject(oldProject);

    // case if not a new project
    if (id != "") {
        // reset of record
        recordModif.add=[""];
        recordModif.del=[""];
        // get consulted project 
        const tempProject = showProject.value.filter(p => p.id == id)

        // copy consulted project in two variables managed history project
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
    // Open box (overlay) of project
    isOpen.value = true;
}

/**
 * Transform data iso in human reading
 * @param rowDate string date in iso 
 */
function localDate(rowDate: string): string {
    return (new Date(rowDate)).toLocaleString();
}

// variable to show/hide progress bar and lock/unlock project box
// (during modification to server you can't continue modify project)
const lockProject = ref<boolean>(false);
// message in progress bar
const msgProgress = ref<string>("");

/**
 * Block project and show progress bar with a message
 * @param msg string message to show in progress bar
 */
function waitingProcess(msg: string) {
    // lock project and show progress bar
    lockProject.value = true;
    // put message in progress bar
    msgProgress.value = msg;
}

/**
 * 
 * @param msg string message when processing is OK
 */
async function processOk(msg: string) {
    // Close project box
    isOpen.value = false;
    // unlock porject and hide progress bar
    lockProject.value = false;
    // empty 
    emptyProject(currentProject);
    // 
    currentFolder = "";
    // Show success message (pop-up)
    toast.add({ title: msg });
    // refresh project table
    await actualize({page:1, itemsPerPage:5, sortBy:[{key:sortProject.value.column, order:sortProject.value.direction}]});
}

/**
 * 
 * @param msg string message when processing is fail
 */
function processFail(msg: string) {
    // unlock project and hide progress bar
    lockProject.value = false;
    // show fail message (pop-up)
    toast.add({ title: msg });
}

/**
 * Create a new project in database
 */
function createProject() {
    // Prepare data to send to server
    const body = new FormData();
    // indicate which tempory folder use to get analyzes files
    body.append("folder", currentFolder);
    // give all info on project
    body.append("project", JSON.stringify(currentProject));
    // todo get team name
    body.append("team", useCookie("team").value as string);
    // todo undisplay modal and waiting popup
    waitingProcess(t("message.waitCreateProject"));
    // ask server create project
    $fetch("api/createProject", {
        method: "POST",
        body: body
    })
        // Indicate success and back to update project table
        .then(() => processOk(currentProject.name + " " + t("message.created")))
        // Indicate fail and stay on project box
        .catch(() => processFail(t("message.createdFail")));
}

/**
 * Update project on database
 */
async function updateProject(){
    // Show waiting bar
    waitingProcess(t("message.updateInProgress"));
    // Array keep all promises
    const holdOn = [];
    // Get list of added file id
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
    <!-- Part of button to add project -->
    <UContainer class="flex justify-start items-left">
        <UTooltip :text="t('label.addProject')" :popper="{ placement: 'right' }">
            <UButton class="extractButton w-1/3" @click="openProject('')" icon="i-heroicons-folder-plus" />
        </UTooltip>
    </UContainer>
    <!-- Part of table show projects of team -->
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
            <!-- Personnalize header -->
            <template v-slot:headers="{ 
                columns, isSorted, getSortIcon, toggleSort }"
            >
                <tr>
                    <template v-for="column in columns" :key="column.key">
                        <td>
                            <!-- headers are clickable -->
                            <div class="cursor-pointer flex items-center" @click="() => toggleSort(column)">
                                <!-- Print title of column -->
                                {{ column.title }}
                                <!-- If we can sort column then show state of 
                                     sort -->
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
            <!-- Print creation date in human readly format -->
            <template v-slot:item.createDate="{ value }">
               {{ localDate(value) }}
            </template>
            <!-- In column action each line have several buttons -->
            <template v-slot:item.action="{ item }">
                <!-- Button to export project in .csv -->
               <UButton :title="t('button.exportProject')" icon="i-heroicons-arrow-down-on-square" size="xl" color="green"
                    variant="link" @click="extract(item.id)" :disabled="item.nbFile == 0" />
                <!-- Button to consult and modify project -->
                <UButton :title="t('button.viewProject')" icon="i-heroicons-pencil" size="xl" color="blue" variant="link"
                    @click="openProject(item.id)" />
                <!-- Button to delete project -->
                <UButton :title="t('button.deleteProject')" icon="i-heroicons-x-mark" size="xl" color="red" variant="link"
                    @click="deleteProject(item.id, item.name)" />
            </template>
            <!-- manage paginition of table -->
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
    <!-- waiting bar   -->
    <v-progress-linear
        :active="lockProject"
        :indeterminate="true"
        absolute
        bottom
        color="deep-purple-accent-4"
    >
        {{ msgProgress }}
    </v-progress-linear>

    <!-- Details / create / modification project box overlay-->
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
                        <!-- Closed button of box -->
                        <UButton color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="closeWinProject()" />
                    </div>
                    <!-- input to add/modify project name -->
                    <UFormGroup name="name">
                        <UInput v-model="currentProject.name" autofocus requires />
                    </UFormGroup>
                </template>
                <!-- tabs -->
                <UTabs :items="containProject">
                    <!-- Name of tabs is translate -->
                    <template #default="{ item }">
                        <span class="truncate">
                            {{ t(item.label) }}
                        </span>
                    </template>
                    <template #item="{ item }">
                        <!-- tab to manage analyzes -->
                        <UTooltip v-if="item.label === 'label.files'" :text="t('label.addFile')"
                            :popper="{ placement: 'right' }">
                            <!-- button to add analyze files -->
                            <input type="file" id="inFilesSelect" multiple style="display: none;" />
                            <UButton color="white" variant="outline" :title="t('label.addFile')"
                                @click="simulateClick('inFilesSelect')" icon="i-heroicons-document-plus" />

                        </UTooltip>
                        <!-- table of analyze files of project -->
                        <v-data-table v-if="item.label === 'label.files'"
                            v-model:items-per-page="itemsPerPage"
                            :headers="tabFilesStruct"
                            :items-length="currentProject.files.length"
                            :items="currentProject.files"
                            :loading="loading > 0"
                            item-value="name"
                        >
                            <!-- custom headers -->
                            <template v-slot:headers="{ 
                                columns, isSorted, getSortIcon, toggleSort }"
                            >
                                <tr>
                                    <template 
                                        v-for="column in columns" 
                                        :key="column.key"
                                    >
                                        <td>
                                            <!-- headers are clickable -->
                                            <div 
                                                class="cursor-pointer flex items-center" 
                                                @click="() => toggleSort(column)"
                                            >
                                                <!-- Print title of column -->
                                                {{ column.title }}
                                                <!-- If we can sort column then
                                                     show state of 
                                                     sort -->
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
                            <!-- custom delete column -->
                            <template v-slot:item.delete="{ item }">
                                <!-- each colunm has button to delete line -->
                                <UButton 
                                    :title="t('button.deleteRow')" 
                                    icon="i-heroicons-x-mark"
                                    size="xl" color="red"
                                    variant="link"
                                    @click="deleteRow(item.id)" 
                                />
                            </template>
                        </v-data-table>
                        <!-- others tabs -->
                        <div v-else>
                            <p>couxcou</p>
                        </div>
                    </template>
                </UTabs>
                <!-- Footer with button to validate only if correct value in
                     project -->
                <template #footer v-if="validProjectName">
                    <!-- Button to update project only if we have modification
                     -->
                    <UButton v-if="currentProject.id != '' && modifiedProject"
                        :title="t('button.update')"
                        icon="i-heroicons-arrow-path"
                        :label="t('button.update')"
                        @click="updateProject()"
                    />
                    <!-- Button create project -->
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
                <!-- confirmation message -->
                <p>{{ t("message.confQuestion") }}</p>
            </v-card-text>
            <!-- Yes / No buttons -->
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