<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<script setup lang="ts">

import { ref, reactive, computed } from "vue";
import type { tFitting } from "../plugins/file";
const { t } = useI18n();
import { string, minLength, trim, object, parse, pipe } from "valibot";
const toast = useToast();



const isOpen = ref<boolean>(false);
const loading = ref<boolean>(false);
const stateConfBox = ref<string>("");
const openConfBox = ref<boolean>(false);

const listMachine = await $fetch("/api/manageControl/getPage",{
    method:"post",
    body:{
        nameTable:"machine",
        page:1,
        itemByPage:10000,
        sortBy:[]
    }
});

const listCompound = await $fetch("/api/manageControl/getPage",{
    method:"post",
    body:{
        nameTable:"compound",
        page:1,
        itemByPage:10000,
        sortBy:[]
    }
});


// Define of struct of table of fitting
const tabFittingStruct = (await $fetch("/api/manageControl/header",{
    method:"post",
    body:{nameTable:"view_fitting"}
})).filter((x: { key: string;}) => !x.key.startsWith("id_"));
tabFittingStruct.push({key:"action", sortable:false});

const compPerPage = ref<number>(5);

// Variable to know by which column the fitting's table sorted
const sortFitting = ref<{
    key: string,
    order: "asc" | "desc" }[]>([{ key: "date_create",
        order: "desc"
    }]);

/**
 * Empty variable (type tFitting) passing in parameter
 * @param fitting 
 */
function emptyFitting(fitting: tFitting) {
    fitting.id = "";
    fitting.archive_date = "";
    fitting.id_compound= "";
    fitting.id_machine= "";
    fitting.date_create= "";
    fitting.url_provider= "";
    fitting.lot= "";
    fitting.rt= 0;
}

// The fitting consulted
const currentFitting = reactive<tFitting>({
    id: "",
    archive_date : "",
    id_compound: "",
    id_machine: "",
    date_create: "",
    url_provider: "",
    lot: "",
    rt: 0
});
// old version of consulted fitting
const oldFitting = reactive<tFitting>({
    id: "",
    archive_date : "",
    id_compound: "",
    id_machine: "",
    date_create: "",
    url_provider: "",
    lot: "",
    rt: 0
});

// Check if consulted fitting was modified
const modifiedFitting = computed<boolean>(() =>
    // thx: https://stackoverflow.com/a/1144249
    JSON.stringify(currentFitting) != JSON.stringify(oldFitting));

const currentPage = ref<number>(1);

/**
 * Get all list of fittings of one page and number of page
 * @param page number page
 */
async function getFittings(page: number = 1): Promise<{
    fittings: tFitting[], count: number
}> {
    const fittings = await $fetch("/api/manageControl/getPage",{
        method:"post",
        body:{
            nameTable:"view_fitting",
            sortBy:sortFitting.value,
            page:page,
            itemByPage:compPerPage.value
        }
    });
    const  totalItems = await $fetch("/api/manageControl/totalItems",{
        method:"post",
        body:{nameTable:"view_fitting"}
    });

    return {fittings: fittings, count: totalItems};
}

// Part define variable to show fittings's list in table
const fittings = reactive<{ fittings: tFitting[], count: number }>(
    await getFittings());
const showFitting = computed(() => fittings.fittings);

async function actualize({page, itemsPerPage, sortBy }) {
    loading.value= true;
    if(sortBy.length){    
        sortFitting.value = sortBy;
    }
    if(itemsPerPage){
        compPerPage.value = itemsPerPage;
    }
    
    await getFittings(page)
        .then((resp) => {
            fittings.fittings = resp.fittings;
            fittings.count = resp.count;
        });    

    currentPage.value = page;
    loading.value=false;
}

// Condition part to valid Fitting name in input 
// and show button to create/modify fitting
const schema = object({
    name: pipe(string(), trim(),
        minLength(3, t("message.badFittingName"))),
});

const validFittingName = computed<boolean>(() => {
    try {
        parse(schema, { name: currentFitting.name });
    } catch (error) {
        return false;
    }

    return true;
});

function openFitting(id: string) {

    emptyFitting(currentFitting);
    emptyFitting(oldFitting);

    if (id != "") {
        const tempFitting = showFitting.value.filter(p => p.id == id);

        currentFitting.id = id;
        currentFitting.id_compound = tempFitting[0].id_compound;
        currentFitting.id_machine = tempFitting[0].id_machine;
        currentFitting.url_provider = tempFitting[0].url_provider;
        currentFitting.archive_date = tempFitting[0].archive_date;
        currentFitting.lot = tempFitting[0].lot;
        currentFitting.rt = tempFitting[0].rt;
        oldFitting.id = id;
        oldFitting.id_compound = tempFitting[0].id_compound;
        oldFitting.id_machine = tempFitting[0].id_machine;
        oldFitting.url_provider = tempFitting[0].url_provider;
        oldFitting.archive_date = tempFitting[0].archive_date;
        oldFitting.lot = tempFitting[0].lot;
        oldFitting.rt = tempFitting[0].rt;
    }
    isOpen.value = true;
}

function localDate(rowDate: string): string {
    return (new Date(rowDate)).toLocaleString();
}

const lockFitting = ref<boolean>(false);
const msgProgress = ref<string>("");

function waitingProcess(msg: string) {
    lockFitting.value = true;
    msgProgress.value = msg;
}

async function processOk(msg: string) {
    isOpen.value = false;
    lockFitting.value = false;
    emptyFitting(currentFitting);
    toast.add({ title: msg });
    await actualize({page:1, itemsPerPage:5, sortBy:sortFitting.value});
}

function processFail(msg: string) {
    lockFitting.value = false;
    toast.add({ title: msg });
}
function createFitting() {
    waitingProcess(t("message.waitCreateFitting"));
    $fetch("/api/manageControl/add", {
        method: "POST",
        body: {
            items: [currentFitting],
            nameTable: "fitting"
        }
    })
        .then(() => processOk(t("message.fitting") + t("message.created")))
        .catch(() => processFail(t("message.createdFail")));
}

async function updateFitting(){
    waitingProcess(t("message.updateInProgress"));

    const rows = await $fetch("/api/manageControl/rows", {
        method:"POST",
        body:{
            nameTable:"used_fitting",
            wheres:{"id_fitting":currentFitting.id}
        }
    });

    const holdOn = [];
    if(rows.length){
        // archived fitting yet used
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:"fitting",
                id: currentFitting.id,
                columns:{archive_date: new Date(Date.now()).toISOString() }
            }
        }));
        // create new compond modified
        holdOn.push($fetch("/api/manageControl/add", {
            method:"POST",
            body:{
                items: [currentFitting],
                nameTable: "fitting"
            }
        }));
    }
    else{
        // modified fitting
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:"fitting",
                id: currentFitting.id,
                columns: {
                    id_compound:currentFitting.id_compound,
                    id_machine:currentFitting.id_machine,
                    date_create:currentFitting.date_create,
                    url_provider:currentFitting.url_provider,
                    lot:currentFitting.lot,
                    rt:currentFitting.rt,
                }  
            }
        }));
    } 

    Promise.all(holdOn)
        .then(() => processOk(t("message.fitting") + 
                  t("message.updateFitting")))
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
 * Manage the close windows of fitting
 */
async function closeWinFitting(){
    
    if((validFittingName.value && currentFitting.id =="")
       || (modifiedFitting.value)){
        isOpen.value = !await confBox(t("message.confLoseModif"));
    }else{
        isOpen.value = false;
    }
}

async function deleteFitting(id:string){
    if(!await confBox(t("message.confDelFitting"))){
        return;
    }
    loading.value=true;

    const rows = await $fetch("/api/manageControl/rows", {
        method:"POST",
        body:{
            nameTable:"used_fitting",
            wheres:{"id_fitting":id}
        }
    });

    const holdOn = [];

    if(rows.length){
        holdOn.push($fetch("/api/manageControl/update", {
            method:"POST",
            body:{
                nameTable:"fitting",
                id: id,
                columns:{archive_date: new Date(Date.now()).toISOString() }
            }
        }));
    }
    else{
        holdOn.push($fetch("/api/manageControl/delete",{
            method: "POST",
            body: {
                nameTable: "fitting",
                id: id
            }
        }));
            
    }
    Promise.all(holdOn)
        .then(() => toast.add({
            title: t("message.okDelFitting"),
            description: t("message.fitting")
        }))
        .catch(() => toast.add({
            title: t("message.koDelFitting"),
            description: t("message.fitting")
        }))
        .finally(() => {
            loading.value =false;
            actualize({page:1, itemsPerPage:5,
                sortBy:sortFitting.value});
        });

}
</script>
    
<template>
  <v-data-table-server
    v-model:items-per-page="compPerPage"
    v-model:page="currentPage"
    :headers="tabFittingStruct"
    :items-length="fittings.count"
    :items="fittings.fittings"
    :loading="loading"
    item-value="name"
    @update:options="actualize"
    @update:page="getFittings"
  >
    <template #top>
      <v-toolbar flat>
        <v-btn
          prepend-icon="mdi-plus"
          @click="openFitting('')"
        >
          {{ t('button.addfitting') }}
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
        :title="t('button.viewFitting')"
        icon="i-heroicons-pencil"
        size="xl"
        color="blue"
        variant="link"
        @click="openFitting(item.id)"
      />
      <UButton
        v-if="item.archive_date==null"
        :title="t('button.deleteFitting')"
        icon="i-heroicons-x-mark"
        size="xl"
        color="red"
        variant="link"
        @click="deleteFitting(item.id)"
      />
    </template>
  </v-data-table-server>

  <v-progress-linear
    :active="lockFitting"
    :indeterminate="true"
    absolute
    bottom
    color="deep-purple-accent-4"
  >
    {{ msgProgress }}
  </v-progress-linear>

  <!-- Details / create / modification fitting box -->
  <UModal
    v-model="isOpen"
    prevent-close
    :display="!lockFitting"
  >
    <UForm
      :schema="schema"
      :state="currentFitting"
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
              {{ t("title.fittingName") }}
            </h3>
            <UButton
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeWinFitting()"
            />
          </div>
        </template>
        <v-select
          v-model="currentFitting.id_compound"
          :items="listCompound"
          item-title="name"
          item-value="id"
          :label="t('label.selectCompound')"
          single-line
        />
        <v-select
          v-model="currentFitting.id_machine"
          :items="listMachine"
          item-title="name"
          item-value="id"
          :label="t('label.selectMachine')"
          single-line
        />
        <VTextField
          v-model="currentFitting.date_create"
          type="date"
          :label="t('label.createDate')"
        />
        <VTextField
          v-model="currentFitting.url_provider"
          type="url"
          :label="t('label.url_provider')"
        />
        <VTextField
          v-model="currentFitting.lot"
          type="text"
          :label="t('label.lot')"
        />
        <VTextField
          v-model="currentFitting.rt"
          type="number"
          :label="t('label.rt')"
        />

        <template
          v-if="currentFitting.id_machine != '' && currentFitting.id_compound != '' && currentFitting.date_create != '' && currentFitting.rt != 0"
          #footer
        >
          <UButton
            v-if="currentFitting.id != '' && modifiedFitting"
            :title="t('button.update')"
            icon="i-heroicons-arrow-path"
            :label="t('button.update')"
            @click="updateFitting()"
          />
          <UButton
            v-if="currentFitting.id == ''"
            :title="t('button.create')"
            icon="i-heroicons-check-badge"
            :label="t('button.create')"
            @click="createFitting()"
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
