<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<!-- This module manage series add / view / delete / archive / modify -->
<script setup lang="ts">
import * as v from 'valibot';
const { t } = useI18n();
// manage display of dialog box 
const dialog = ref<boolean>(false);
// manage display of dialog box in view mode (no modification possible)
const dialogView = ref<boolean>(false);
// manage possibility to add or modify a serie in dialog box
const validateForm = ref(false);
// toggle to update table of serie
const rUpload = ref(false);
// manage display of message
const stateMessage = useState<{actif:boolean,
                               message:string,
                               type:string}>("stateMessage")
// Rules for valid name serie
const nameRules = ref([
  (value: string) => 
    useValibot(v.pipe(v.string(), v.nonEmpty(t('message.noEmpty'))),value),
]);

// Variable get file upload by user
const daughterFile = ref<File | null>(null);
// Variable to store name of the serie
const nameSerie = ref<string>("");
// List of metabolite's info by daughter solution of the serie
const rDaughterTable = ref<{
    idFile: string;
    nameFile: string;
    nameMeta: string;
    area: number;
    expectedArea: number}[]>([]);
const rDaughterLoading = ref<boolean>(false);

/**
 * Add a new serie
 */
async function add() {
  // reset form
  rDaughterTable.value = [];
  nameSerie.value = "";
  // Open dialog to add a new serie
  dialog.value = true;
  dialogView.value = false;
}

/**
 * Send file to the server to validate file format and extract data
 * We update table of metabolites of the serie
 */
async function sendFile() {

  // Check if we have a file
  if (!daughterFile.value) {
    return;
  }

  // check file no empty
  if (daughterFile.value.size === 0) {
    // TODO: show error message
    return;
  }
  
  // send file to the server
  rDaughterLoading.value = true;
  // - Put file in a FormData object to send all format file 
  //   (ex: csv, xls, xlsx, ...)
  const formData = new FormData();
  formData.append('file', daughterFile.value);
  // - send file to the server
  const result =await $fetch('/api/extractFromFile', {
    method: 'POST',
    body: formData,
  });
  
  // check if the file is empty or not a valid file
  if (typeof result === 'number' || result.length === 0) {
    return;
  }
  // Update table of metabolites of the serie
  rDaughterTable.value.push(
    ...result[1].map((r: [string, number]) => ({
      idFile: result[0],
      nameFile: daughterFile.value?.name || "error",
      nameMeta: r[0],
      area: r[1],
      expectedArea: 0,
  })));
  
  // reset file input
  daughterFile.value = null;
  rDaughterLoading.value = false;
}

/**
 * Submit the form to create a new serie
 * @param event 
 */
async function submit (event:SubmitEvent) { 
  
  // Group value by file (daughter solution) 
  const daughterGroup = rDaughterTable.value.reduce(
    (acc: {[key:string]:{}[]}, cur:{
        idFile: string;
        nameMeta: string;
        area: number;
        expectedArea: number;
  }) => {
    if (!acc[cur.idFile]) {
      acc[cur.idFile] = [];
    }
    acc[cur.idFile].push({
      nameMeta:cur.nameMeta,
      area:cur.area,
      expectedArea:cur.expectedArea
    });
    return acc;
  }, {});  
  // send serie name and all associated daughter solution 
  $fetch('/api/AddSerie', {
    method: 'POST',
    body: JSON.stringify({
      nameSerie: event?.target?.elements?.nameSerie.value,
      daughterGroup,
    }),
  })
  .then(() => {
    // We update the daughter table
    rUpload.value = !rUpload.value;
    // show message whose say the creation of serie is a success
    stateMessage.value.type="success"
    stateMessage.value.message=t("message.success.createSerie")
    stateMessage.value.actif=true
    
  })
  .catch(() => {
    // show message whose say the creation of serie is a failure
    stateMessage.value.type="error"
    stateMessage.value.message=t("message.error.createSerie")
    stateMessage.value.actif=true
  });
}

/**
 * we show the serie in view mode
 * @param item {id:String, name:String} series information
 */
function view(item: {id: string, name: string}){
  
  // Add the name of series
  nameSerie.value = item.name;
  // Open dialog to view the serie
  dialog.value = true;
  // Show loader to wait get all daughter solution
  rDaughterLoading.value = true;
  // Indicate that we are in view mode
  dialogView.value = true;
  
  // Get all daughter solution of the serie
  $fetch("/api/manageControl/rows",{
    method: 'POST',
    body: {
      nameTable: "view_daughter_file",        
      wheres:{
        id_series:item.id}
    }
  
  })
  .then((result) => {
    // Update table of daughter solution of the serie
    rDaughterTable.value = result.map((row: {[key:string]:string|number}) => ({
      idFile: row.id,
      nameFile: row.name,
      nameMeta: row.mol,
      area: row.area,
      expectedArea: row.expected,
    }));
    // End loading
    rDaughterLoading.value = false;
  })
  .catch(() => {
    // End loading
    rDaughterLoading.value = false;
    // close dialog box
    dialog.value = false;
    dialogView.value = false;
    // TODO: show message whose say the view of serie is a failure
  });
}

</script>

<template>
  <!-- Table display all series -->
  <table-db-action 
    name-db-table="view_show_serie" 
    :add="add"
    :view="view"
    :update="rUpload"
  />
  <!-- Dialog Box to add / view and modify serie -->
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-form
      v-model="validateForm"
      validate-on="lazy blur"
      :disabled="dialogView"
      @submit.prevent="submit"
    >
      <v-card>
        <!-- TODO: modify title of dialog box about action -->
        <v-card-title>
          <span class="headline">{{ t('title.addSerie') }}</span>
        </v-card-title>
        <v-card-text>
          <!-- Name of serie field -->
          <v-text-field
            v-model="nameSerie"
            name="nameSerie"
            :counter="10"
            :rules="nameRules"
            :label="t('label.nameSerie')"
            required
          />
        </v-card-text>
        <v-expansion-panels>
          <!-- Tab where define on whose machine apply serie -->
          <v-expansion-panel
            :title="t('title.machine')"
            disabled
          >
            <v-expansion-panel-text>
              helle 
            </v-expansion-panel-text>
          </v-expansion-panel>
          <!-- Tab where define mothers solution -->
          <v-expansion-panel
            :title="t('title.mother')"
            disabled
          >
            <v-expansion-panel-text>
              helle 
            </v-expansion-panel-text>
          </v-expansion-panel>
          <!-- Tab where define daughter solution -->
          <v-expansion-panel
            :title="t('title.daughter')"
          >
            <v-expansion-panel-text>
              <!-- waiting end loading file -->
              <v-progress-circular
                v-if="rDaughterLoading"
                color="primary"
                indeterminate
              />
              <!-- part to add daughter file -->
              <v-file-input
                v-else
                v-model="daughterFile"
                :label="t('label.daughterFile')"
                :click:append="sendFile()"
                prepend-icon="mdi-water-plus"
                hide-input
              />
              <!-- show metabolite of daughter solution and enter area expected
              -->
              <daughter-table
                v-model="rDaughterTable"
                :view-mode="dialogView"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <!-- TODO: modifty name and action of button about action -->
        <!-- Button to save/close dialog box -->
        <v-btn
          v-if="!dialogView"
          color="primary"
          text="Save"
          type="submit"
          :disabled="!(validateForm === true)"
          @click="dialog = false"
        />
      </v-card>
    </v-form>
  </v-dialog>
</template>
