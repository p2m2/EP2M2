<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<script setup lang="ts">
// const { t } = useI18n();
const props = defineProps({
    nameTable: {
        type:String,
        required:true
    }
});

import { ref, reactive, computed } from "vue";
import type { tMachine } from "../plugins/file";
// import { useI18n, useToast } from "#imports";
const { t } = useI18n();
import { string, minLength, toTrimmed, object, parse } from "valibot";
const toast = useToast();


const isOpen = ref<boolean>(false);
const loading = ref<boolean>(false);
const stateConfBox = ref<string>("");
const openConfBox = ref<boolean>(false);

// Define of struct of table of machine
const tabMachineStruct = await $fetch("/api/manageControl/header",{
    method:"post",
    body:{nameTable:props.nameTable}
});
tabMachineStruct.push({key:"action", sortable:false});

const compPerPage = ref<number>(5);

// Variable to know by which column the machine's table sorted
const sortMachine = ref<{
    key: string,
    order: "asc" | "desc" }[]>([{ key: "name",
        order: "desc"
    }]);

/**
 * Empty variable (type tMachine) passing in parameter
 * @param machine 
 */
function emptyMachine(machine: tMachine) {
    machine.id = "";
    machine.name = "";
    machine.m_type = "";
    machine.description = "";
    machine.archive_date = "";
}

// The machine consulted
const currentMachine = reactive<tMachine>({
    id: "",
    name: "",
    description: "",
    m_type: "",
    archive_date: ""
});
// old version of consulted machine
const oldMachine = reactive<tMachine>({
    id: "",
    name: "",
    description: "",
    m_type: "",
    archive_date: ""
});

// Check if consulted machine was modified
const modifiedMachine = computed<boolean>(() =>
    // thx: https://stackoverflow.com/a/1144249
    JSON.stringify(currentMachine) != JSON.stringify(oldMachine));

// record modification of machine
const recordModif = {
    name:computed<string>(() =>
        (modifiedMachine.value && oldMachine.name != currentMachine.name)?
            currentMachine.name : ""
    ),
    add:[""], del: [""]
};

const currentPage = ref<number>(1);

/**
 * Get all list of machines of one page and number of page
 * @param page number page
 */
async function getMachines(page: number = 1): Promise<{
    machines: tMachine[], count: number
}> {
    const machines = await $fetch("/api/manageControl/getPage",{
        method:"post",
        body:{
            nameTable:props.nameTable,
            sortBy:sortMachine.value,
            page:page,
            itemByPage:compPerPage.value
        }
    });
    const  totalItems = await $fetch("/api/manageControl/totalItems",{
        method:"post",
        body:{nameTable:props.nameTable}
    });

    return {machines: machines, count: totalItems};
}

// Part define variable to show machines's list in table
const machines = reactive<{ machines: tMachine[], count: number }>(
    await getMachines());
const showMachine = computed(() => machines.machines);

async function actualize({page, itemsPerPage, sortBy }) {
    loading.value= true;
    if(sortBy.length){    
        sortMachine.value = sortBy;
    }
    if(itemsPerPage){
        compPerPage.value = itemsPerPage;
    }
    
    await getMachines(page)
        .then((resp) => {
            machines.machines = resp.machines;
            machines.count = resp.count;
        });    

    currentPage.value = page;
    loading.value=false;
}

// Condition part to valid Machine name in input 
// and show button to create/modify machine
const schema = object({
    name: string([
        toTrimmed(),
        minLength(3, t("message.badMachineName"))
    ]),
});

const validMachineName = computed<boolean>(() => {
    try {
        parse(schema, { name: currentMachine.name });
    } catch (error) {
        return false;
    }

    return true;
});

function openMachine(id: string) {

    emptyMachine(currentMachine);
    emptyMachine(oldMachine);

    if (id != "") {
        // reset of record
        recordModif.add=[""];
        recordModif.del=[""];
        const tempMachine = showMachine.value.filter(p => p.id == id);

        currentMachine.id = id;
        currentMachine.name = tempMachine[0].name;
        currentMachine.description = tempMachine[0].description;
        currentMachine.m_type = tempMachine[0].m_type;
        currentMachine.archive_date = tempMachine[0].archive_date;
        oldMachine.id = id;
        oldMachine.name = tempMachine[0].name;
        oldMachine.description = tempMachine[0].description;
        oldMachine.m_type = tempMachine[0].m_type;
        oldMachine.archive_date = tempMachine[0].archive_date;
    }
    isOpen.value = true;
}

function localDate(rowDate: string): string {
    return (new Date(rowDate)).toLocaleString();
}

const lockMachine = ref<boolean>(false);
const msgProgress = ref<string>("");

function waitingProcess(msg: string) {
    lockMachine.value = true;
    msgProgress.value = msg;
}

async function processOk(msg: string) {
    isOpen.value = false;
    lockMachine.value = false;
    emptyMachine(currentMachine);
    toast.add({ title: msg });
    await actualize({page:1, itemsPerPage:5, sortBy:sortMachine.value});
}

function processFail(msg: string) {
    lockMachine.value = false;
    toast.add({ title: msg });
}
function createMachine() {
    waitingProcess(t("message.waitCreateMachine"));
    $fetch("/api/manageControl/add", {
        method: "POST",
        body: {
            items: [currentMachine],
            nameTable: props.nameTable
        }
    })
        .then(() => processOk(currentMachine.name + " " + t("message.created")))
        .catch(() => processFail(t("message.createdFail")));
}

async function updateMachine(){
    waitingProcess(t("message.updateInProgress"));

    const rows = await $fetch("/api/manageControl/rows", {
        method:"POST",
        body:{
            nameTable:"fitting",
            wheres:{"id_machine":currentMachine.id}
        }
    });

    const holdOn = [];
    if(rows.length){
        // archived machine yet used
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:props.nameTable,
                id: currentMachine.id,
                columns:{archive_date: new Date(Date.now()).toISOString() }
            }
        }));
        // create new compond modified
        holdOn.push($fetch("/api/manageControl/add", {
            method:"POST",
            body:{
                items: [currentMachine],
                nameTable: props.nameTable
            }
        }));
    }
    else{
        // modified machine
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:props.nameTable,
                id: currentMachine.id,
                columns: {
                    name: currentMachine.name,
                    description: currentMachine.description,
                    m_type: currentMachine.m_type,
                }  
            }
        }));
    } 

    Promise.all(holdOn)
        .then(() => processOk(currentMachine.name + " " + 
                          t("message.updateMachine")))
        .catch(() => processFail(t("message.updateFail")));    
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
        stateConfBox.value ="";       
        return true;
    }else{
        stateConfBox.value ="";       
        return false;
    }
}

/**
 * Manage the close windows of machine
 */
async function closeWinMachine(){
    
    if((validMachineName.value && currentMachine.id =="")
       || (modifiedMachine.value)){
        isOpen.value = !await confBox(t("message.confLoseModif"));
    }else{
        isOpen.value = false;
    }
}

async function deleteMachine(id:string, name:string){
    if(!await confBox(t("message.confDelMachine"))){
        return;
    }
    loading.value=true;

    const rows = await $fetch("/api/manageControl/rows", {
        method:"POST",
        body:{
            nameTable:"fitting",
            wheres:{"id_machine":id}
        }
    });

    const holdOn = [];

    if(rows.length){
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:props.nameTable,
                id: id,
                columns:{archive_date: new Date(Date.now()).toISOString() }
            }
        }));
    }
    else{
        holdOn.push($fetch("/api/manageControl/delete",{
            method: "POST",
            body: {
                nameTable: props.nameTable,
                id: id
            }
        }));
            
    }
    Promise.all(holdOn)
        .then(() => toast.add({
            title: t("message.okDelMachine"),
            description: name
        }))
        .catch(() => toast.add({
            title: t("message.koDelMachine"),
            description: name
        }))
        .finally(() => {
            loading.value =false;
            actualize({page:1, itemsPerPage:5,
                sortBy:sortMachine.value});
        });

}
</script>
    
<template>
  <v-data-table-server
    v-model:items-per-page="compPerPage"
    v-model:page="currentPage"
    :headers="tabMachineStruct"
    :items-length="machines.count"
    :items="machines.machines"
    :loading="loading"
    item-value="name"
    @update:options="actualize"
    @update:page="getMachines"
  >
    <template #top>
      <v-toolbar flat>
        <v-btn
          prepend-icon="mdi-plus"
          @click="openMachine('')"
        >
          {{ t('button.add' + props.nameTable) }}
        </v-btn>
      </v-toolbar>
    </template>

    <template
      #headers="{ 
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
              {{ t("header."+column.key) }}
              <UIcon
                v-if="column.sortable"
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
    <template #item.archive_date="{ value }">
      {{ value==null?"":localDate(value) }}
    </template>
    <template
      #item.action="{ item }"
    >
      <UButton
        v-if="item.archive_date==null"
        :title="t('button.viewMachine')"
        icon="i-heroicons-pencil"
        size="xl"
        color="blue"
        variant="link"
        @click="openMachine(item.id)"
      />
      <UButton
        v-if="item.archive_date==null"
        :title="t('button.deleteMachine')"
        icon="i-heroicons-x-mark"
        size="xl"
        color="red"
        variant="link"
        @click="deleteMachine(item.id, item.name)"
      />
    </template>
  </v-data-table-server>

  <v-progress-linear
    :active="lockMachine"
    :indeterminate="true"
    absolute
    bottom
    color="deep-purple-accent-4"
  >
    {{ msgProgress }}
  </v-progress-linear>

  <!-- Details / create / modification machine box -->
  <UModal
    v-model="isOpen"
    prevent-close
    :display="!lockMachine"
  >
    <UForm
      :schema="schema"
      :state="currentMachine"
      class="space-y-4"
    >
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold
                                leading-6 text-gray-900 
                                dark:text-white"
            >
              {{ t("title.machineName") }}
            </h3>
            <UButton
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeWinMachine()"
            />
          </div>
          <UFormGroup name="name">
            <UInput
              v-model="currentMachine.name"
              autofocus
              requires
            />
          </UFormGroup>
        </template>
        <v-text-field
          v-model="currentMachine.m_type"
          :label="t('label.m_type')"
        />
        <v-textarea
          v-model="currentMachine.description"
          clearable
          :label="t('label.description')"
        />
        <template
          v-if="validMachineName"
          #footer
        >
          <UButton
            v-if="currentMachine.id != '' && modifiedMachine"
            :title="t('button.update')"
            icon="i-heroicons-arrow-path"
            :label="t('button.update')"
            @click="updateMachine()"
          />
          <UButton
            v-if="currentMachine.id == ''"
            :title="t('button.create')"
            icon="i-heroicons-check-badge"
            :label="t('button.create')"
            @click="createMachine()"
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
        <p id="confirMsgId" />
        <br>
        <p>{{ t("message.confQuestion") }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="openConfBox=false; stateConfBox='yes'"
        >
          {{ t("button.yes") }}
        </v-btn>
        <v-btn
          color="primary"
          @click="openConfBox=false"
        >
          {{ t("button.no") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

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
