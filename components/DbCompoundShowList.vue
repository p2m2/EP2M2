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
import type { tCompound } from "../plugins/file";
// import { useI18n, useToast } from "#imports";
const { t } = useI18n();
import { string, minLength, toTrimmed, object, parse } from "valibot";
const toast = useToast();


const isOpen = ref<boolean>(false);
const loading = ref<boolean>(false);
const stateConfBox = ref<string>("");
const openConfBox = ref<boolean>(false);

// Define of struct of table of compound
const tabCompoundStruct = await $fetch("/api/manageControl/header",{
    method:"post",
    body:{nameTable:props.nameTable}
});
tabCompoundStruct.push({key:"action", sortable:false});

const compPerPage = ref<number>(5);

// Variable to know by which column the compound's table sorted
const sortCompound = ref<{
    key: string,
    order: "asc" | "desc" }[]>([{ key: "name",
        order: "desc"
    }]);

/**
 * Empty variable (type tCompound) passing in parameter
 * @param compound 
 */
function emptyCompound(compound: tCompound) {
    compound.id = "";
    compound.name = "";
    compound.url = "";
    compound.description = "";
    compound.archive_date = "";
}

// The compound consulted
const currentCompound = reactive<tCompound>({
    id: "",
    name: "",
    description: "",
    url: "0",
    archive_date: ""
});
// old version of consulted compound
const oldCompound = reactive<tCompound>({
    id: "",
    name: "",
    description: "",
    url: "",
    archive_date: ""
});

// Check if consulted compound was modified
const modifiedCompound = computed<boolean>(() =>
    // thx: https://stackoverflow.com/a/1144249
    JSON.stringify(currentCompound) != JSON.stringify(oldCompound));

// record modification of compound
const recordModif = {
    name:computed<string>(() =>
        (modifiedCompound.value && oldCompound.name != currentCompound.name)?
            currentCompound.name : ""
    ),
    add:[""], del: [""]
};

const currentPage = ref<number>(1);

/**
 * Get all list of compounds of one page and number of page
 * @param page number page
 */
async function getCompounds(page: number = 1): Promise<{
    compounds: tCompound[], count: number
}> {
    const compounds = await $fetch("/api/manageControl/getPage",{
        method:"post",
        body:{
            nameTable:props.nameTable,
            sortBy:sortCompound.value,
            page:page,
            itemByPage:compPerPage.value
        }
    });
    const  totalItems = await $fetch("/api/manageControl/totalItems",{
        method:"post",
        body:{nameTable:props.nameTable}
    });

    return {compounds: compounds, count: totalItems};
}

// Part define variable to show compounds's list in table
const compounds = reactive<{ compounds: tCompound[], count: number }>(
    await getCompounds());
const showCompound = computed(() => compounds.compounds);

async function actualize({page, itemsPerPage, sortBy }) {
    loading.value= true;
    if(sortBy.length){    
        sortCompound.value = sortBy;
    }
    if(itemsPerPage){
        compPerPage.value = itemsPerPage;
    }
    
    await getCompounds(page)
        .then((resp) => {
            compounds.compounds = resp.compounds;
            compounds.count = resp.count;
        });    

    currentPage.value = page;
    loading.value=false;
}

// Condition part to valid Compound name in input 
// and show button to create/modify compound
const schema = object({
    name: string([
        toTrimmed(),
        minLength(3, t("message.badCompoundName"))
    ]),
});

const validCompoundName = computed<boolean>(() => {
    try {
        parse(schema, { name: currentCompound.name });
    } catch (error) {
        return false;
    }

    return true;
});

function openCompound(id: string) {

    emptyCompound(currentCompound);
    emptyCompound(oldCompound);

    if (id != "") {
        // reset of record
        recordModif.add=[""];
        recordModif.del=[""];
        const tempCompound = showCompound.value.filter(p => p.id == id);

        currentCompound.id = id;
        currentCompound.name = tempCompound[0].name;
        currentCompound.description = tempCompound[0].description;
        currentCompound.url = tempCompound[0].url;
        currentCompound.archive_date = tempCompound[0].archive_date;
        oldCompound.id = id;
        oldCompound.name = tempCompound[0].name;
        oldCompound.description = tempCompound[0].description;
        oldCompound.url = tempCompound[0].url;
        oldCompound.archive_date = tempCompound[0].archive_date;
    }
    isOpen.value = true;
}

function localDate(rowDate: string): string {
    return (new Date(rowDate)).toLocaleString();
}

const lockCompound = ref<boolean>(false);
const msgProgress = ref<string>("");

function waitingProcess(msg: string) {
    lockCompound.value = true;
    msgProgress.value = msg;
}

async function processOk(msg: string) {
    isOpen.value = false;
    lockCompound.value = false;
    emptyCompound(currentCompound);
    toast.add({ title: msg });
    await actualize({page:1, itemsPerPage:5, sortBy:sortCompound.value});
}

function processFail(msg: string) {
    lockCompound.value = false;
    toast.add({ title: msg });
}
function createCompound() {
    waitingProcess(t("message.waitCreateCompound"));
    $fetch("/api/manageControl/add", {
        method: "POST",
        body: {
            items: [currentCompound],
            nameTable: props.nameTable
        }
    })
        .then(() => processOk(currentCompound.name + " " + t("message.created")))
        .catch(() => processFail(t("message.createdFail")));
}

async function updateCompound(){
    waitingProcess(t("message.updateInProgress"));

    const rows = await $fetch("/api/manageControl/rows", {
        method:"POST",
        body:{
            nameTable:"fitting",
            wheres:{"id_compound":currentCompound.id}
        }
    });

    const holdOn = [];
    if(rows.length){
        // archived compound yet used
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:props.nameTable,
                id: currentCompound.id,
                columns:{archive_date: new Date(Date.now()).toISOString() }
            }
        }));
        // create new compond modified
        holdOn.push($fetch("/api/manageControl/add", {
            method:"POST",
            body:{
                items: [currentCompound],
                nameTable: props.nameTable
            }
        }));
    }
    else{
        // modified compound
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:props.nameTable,
                id: currentCompound.id,
                columns: {
                    name: currentCompound.name,
                    description: currentCompound.description,
                    url: currentCompound.url,
                }  
            }
        }));
    } 

    Promise.all(holdOn)
        .then(() => processOk(currentCompound.name + " " + 
                          t("message.updateCompound")))
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
 * Manage the close windows of compound
 */
async function closeWinCompound(){
    
    if((validCompoundName.value && currentCompound.id =="")
       || (modifiedCompound.value)){
        isOpen.value = !await confBox(t("message.confLoseModif"));
    }else{
        isOpen.value = false;
    }
}

async function deleteCompound(id:string, name:string){
    if(!await confBox(t("message.confDelCompound"))){
        return;
    }
    loading.value=true;

    const rows = await $fetch("/api/manageControl/rows", {
        method:"POST",
        body:{
            nameTable:"fitting",
            wheres:{"id_compound":id}
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
            title: t("message.okDelCompound"),
            description: name
        }))
        .catch(() => toast.add({
            title: t("message.koDelCompound"),
            description: name
        }))
        .finally(() => {
            loading.value =false;
            actualize({page:1, itemsPerPage:5,
                sortBy:sortCompound.value});
        });

}
</script>
    
<template>
  <v-data-table-server
    v-model:items-per-page="compPerPage"
    v-model:page="currentPage"
    :headers="tabCompoundStruct"
    :items-length="compounds.count"
    :items="compounds.compounds"
    :loading="loading"
    item-value="name"
    @update:options="actualize"
    @update:page="getCompounds"
  >
    <template #top>
      <v-toolbar flat>
        <v-btn
          prepend-icon="mdi-plus"
          @click="openCompound('')"
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
        :title="t('button.viewCompound')"
        icon="i-heroicons-pencil"
        size="xl"
        color="blue"
        variant="link"
        @click="openCompound(item.id)"
      />
      <UButton
        v-if="item.archive_date==null"
        :title="t('button.deleteCompound')"
        icon="i-heroicons-x-mark"
        size="xl"
        color="red"
        variant="link"
        @click="deleteCompound(item.id, item.name)"
      />
    </template>
  </v-data-table-server>

  <v-progress-linear
    :active="lockCompound"
    :indeterminate="true"
    absolute
    bottom
    color="deep-purple-accent-4"
  >
    {{ msgProgress }}
  </v-progress-linear>

  <!-- Details / create / modification compound box -->
  <UModal
    v-model="isOpen"
    prevent-close
    :display="!lockCompound"
  >
    <UForm
      :schema="schema"
      :state="currentCompound"
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
              {{ t("title.compoundName") }}
            </h3>
            <UButton
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeWinCompound()"
            />
          </div>
          <UFormGroup name="name">
            <UInput
              v-model="currentCompound.name"
              autofocus
              requires
            />
          </UFormGroup>
        </template>
        <v-text-field
          v-model="currentCompound.url"
          :label="t('label.url')"
        />
        <v-textarea
          v-model="currentCompound.description"
          clearable
          :label="t('label.description')"
        />
        <template
          v-if="validCompoundName"
          #footer
        >
          <UButton
            v-if="currentCompound.id != '' && modifiedCompound"
            :title="t('button.update')"
            icon="i-heroicons-arrow-path"
            :label="t('button.update')"
            @click="updateCompound()"
          />
          <UButton
            v-if="currentCompound.id == ''"
            :title="t('button.create')"
            icon="i-heroicons-check-badge"
            :label="t('button.create')"
            @click="createCompound()"
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
