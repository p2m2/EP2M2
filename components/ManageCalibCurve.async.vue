<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<!-- This module manage calibration curves add / view / delete / archive / modify -->
<script setup lang="ts">
import * as v from 'valibot';
import { useConfirmBox } from '~/composables/useConfirmBox';
import { useMessage } from '~/composables/useMessage';


const { t } = useI18n();
// manage display of dialog box 
const dialog = ref<boolean>(false);
// manage display of dialog box in view mode (no modification possible)
const dialogView = ref<boolean>(false);
// manage possibility to add or modify a calibration curve in dialog box
const validateForm = ref(false);
// toggle to update table of calibration curve
const rUpload = ref(false);
// manage display of message
const {success, error} = useMessage();
// Rules for valid name calibration curve
const nameRules = ref([
  (value: string) => 
    useValibot(v.pipe(v.string(), v.nonEmpty(t('message.noEmpty'))),value),
]);

// Variable get file upload by user
const daughterFile = ref<File | null>(null);
// Variable to store name of the calibration curve
const nameCalibCurve = ref<string>("");
// Variable to store id of the calibration curve
const idCalibCurve = ref<string>("");
// List of metabolite's info by daughter solution of the calibration curve
const rDaughterTable = ref<{
    idFile: string;
    nameFile: string;
    nameMeta: string;
    area: number;
    concentration: number}[]>([]);
const rDaughterLoading = ref<boolean>(false);

/**
 * Add a new calibration curve
 */
async function add() {
  // reset form
  rDaughterTable.value = [];
  nameCalibCurve.value = "";
  // Open dialog to add a new calibration curve
  dialog.value = true;
  dialogView.value = false;
}

/**
 * Send file to the server to validate file format and extract data
 * We update table of metabolites of the calibration curve
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
  // Update table of metabolites of the calibration curve
  rDaughterTable.value.push(
    ...result[1].map((r: [string, number]) => ({
      idFile: result[0],
      nameFile: daughterFile.value?.name || "error",
      nameMeta: r[0],
      area: r[1],
      concentration: 0,
  })));
  
  // reset file input
  daughterFile.value = null;
  rDaughterLoading.value = false;
}

function createDaughterGroup() {
  return rDaughterTable.value.reduce(
    (acc: {[key:string]:{}[]}, cur:{
        idFile: string;
        nameMeta: string;
        area: number;
        concentration: number;
  }) => {
    if (!acc[cur.idFile]) {
      acc[cur.idFile] = [];
    }
    acc[cur.idFile].push({
      nameMeta:cur.nameMeta,
      area:cur.area,
      concentration:cur.concentration
    });
    return acc;
  }, {});
}

/**
 * Submit the form to create a new calibration curve
 * @param event 
 */
async function submit (event:SubmitEvent) { 
  
  // Group value by file (daughter solution) 
  const daughterGroup = createDaughterGroup();  
  // send calibration curve name and all associated daughter solution 
  $fetch('/api/AddCalibCurve', {
    method: 'POST',
    body: JSON.stringify({
      nameCalibCurve: event?.target?.elements?.nameCalibCurve.value,
      daughterGroup,
    }),
  })
  .then(() => {
    // We update the daughter table
    rUpload.value = !rUpload.value;
    // show message whose say the creation of calibration curve is a success
    success(t("message.success.createCalibCurve"));  
    dialog.value = false 
  })
  .catch(() => {
    // show message whose say the creation of calibration curve is a failure
    error(t("message.error.createCalibCurve"))
  });
}

function openCalibCurve(item: {id: string, name: string}) {

  // Add the name of calibration curves
  nameCalibCurve.value = item.name;
  // Open dialog to view the calibration curve
  dialog.value = true;
  // Show loader to wait get all daughter solution
  rDaughterLoading.value = true;
  
  // Get all daughter solution of the calibration curve
  $fetch("/api/manageControl/rows",{
    method: 'POST',
    body: {
      nameTable: "view_daughter_file",        
      wheres:{
        id_calib_curves:item.id}
    }
  
  })
  .then((result) => {
    // Update table of daughter solution of the calibration curve
    rDaughterTable.value = result.map((row: {[key:string]:string|number}) => ({
      idFile: row.id,
      nameFile: row.name,
      nameMeta: row.mol,
      area: row.area,
      concentration: row.concentration,
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
    // TODO: show message whose say the view of calibration curve is a failure
  });

}

/**
 * we show the calibration curve in view mode
 * @param item {id:String, name:String} calibration curves information
 */
function view(item: {id: string, name: string}){
  // Indicate that we are in view mode
  dialogView.value = true;
  // Open dialog to view the calibration curve
  openCalibCurve(item);
}

/**
 * Open dialog box to modify calibration curve
 * @param item {id:String, name:String} calibration curves information
 */
function modify(item: {id: string, name: string}) {
  // Indicate that we are not in view mode
  dialogView.value = false;
  // Add the id of calibration curves. Indicate that we are in modify mode
  idCalibCurve.value = item.id;
  // Open dialog to modify the calibration curve
  openCalibCurve(item);
}

/**
 * Update calibration curve
 */
function updateCalibCurve(){
  // Group value by file (daughter solution) 
  const daughterGroup = createDaughterGroup();  
  // send calibration curve id and all associated daughter solution to update
  // TODO: update only changed part 
  $fetch('/api/UpdateCalibCurve',{
    method: 'POST',
    body: {
      idCalibCurve: idCalibCurve.value,
      nameCalibCurve: nameCalibCurve.value,
      daughters: daughterGroup,
    },
  })
  .then(() => {
    // We update the daughter table
    rUpload.value = !rUpload.value;
    // show message whose say the update of calibration curve is a success
    success(t("message.success.updateCalibCurve"));
    dialog.value = false;
  })
  .catch(() => {
    // show message whose say the update of calibration curve is a failure
    error(t("message.error.updateCalibCurve"));
  });
}

/**
 * Confirm the delete of calibration curve
 * @param item {id:String, name:String} calibration curves information
 */
function deleteCalibCurveAction(item: {id: string, name: string}){
  // ask user to confirm the delete of calibration curve
  useConfirmBox(t("message.confirm.deleteCalibCurve"))
  .then((answer) => {
    // if user confirm the delete of calibration curve
    if (answer) {
      // delete calibration curve
      deleteCalibCurve(item);
    }
  });
}

/**
 * Delete calibration curve
 */
function deleteCalibCurve(item: {id: string, name: string}){
  // send calibration curve id to delete
  $fetch('/api/manageControl/delete',{
    method: 'POST',
    body: {
      nameTable: "calib_curves",
      id: item.id,
    },
  })
  .then(() => {
    // We update the daughter table
    rUpload.value = !rUpload.value;
    // show message whose say the delete of calibration curve is a success
    success(t("message.success.deleteCalibCurve"));
  })
  .catch(() => {
    // show message whose say the delete of calibration curve is a failure
    error(t("message.error.deleteCalibCurve"));
  });
}

function achiveCalibCurveAction(item: {id: string, name: string}){
  // ask user to confirm the archive of calibration curve
  useConfirmBox(t("message.confirm.archiveCalibCurve"))
  .then((answer) => {
    // if user confirm the archive of calibration curve
    if (answer) {
      // archive calibration curve
      archiveCalibCurve(item);
    }
  });
}

/**
 * Archive calibration curve
 */
function archiveCalibCurve(item: {id: string, name: string}){
  // send calibration curve id to archive
  $fetch('/api/manageControl/update',{
    method: 'POST',
    body: {
      nameTable: "calib_curves",
      id: item.id,
      columns: {
        date_achieve: (new Date()).toISOString(),
      },
    },
  })
  .then(() => {
    // We update the daughter table
    rUpload.value = !rUpload.value;
    // show message whose say the archive of calibration curve is a success
    success(t("message.success.archiveCalibCurve"));
  })
  .catch(() => {
    // show message whose say the archive of calibration curve is a failure
    error(t("message.error.archiveCalibCurve"));
  });
}

</script>

<template>
  <!-- Table display all calibration curves -->
  <table-db-action 
    name-db-table="view_show_calib_curve" 
    :add="add"
    :view="view"
    :modify="modify"
    :delete="deleteCalibCurveAction"
    :archive="achiveCalibCurveAction"
    :update="rUpload"
  />
  <!-- Dialog Box to add / view and modify calibration curve -->
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-form
      v-model="validateForm"
      validate-on="blur"
      :disabled="dialogView"
      @submit.prevent="submit"
    >
      <v-card>
        <!-- TODO: modify title of dialog box about action -->
        <v-card-title>
          <span class="headline">{{ t('title.addCalibCurve') }}</span>
        </v-card-title>
        <v-card-text>
          <!-- Name of calibration curve field -->
          <v-text-field
            v-model="nameCalibCurve"
            name="nameCalibCurve"
            :counter="10"
            :rules="nameRules"
            :label="t('label.nameCalibCurve')"
            required
          />
        </v-card-text>
        <v-expansion-panels>
          <!-- Tab where define on whose machine apply calibration curve -->
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
              <!-- show metabolite of daughter solution and enter concentration
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
          v-if="dialogView"
          color="primary"
          :text="t('button.close')"
          @click="dialog = false"
        />
        <v-btn
          v-else-if="idCalibCurve !== ''"
          color="primary"
          :text="t('button.modify')"
          :disabled="!(validateForm === true)"
          @click="updateCalibCurve"
        />
        <v-btn
          v-else
          color="primary"
          :text="t('button.save')"
          type="submit"
          :disabled="!(validateForm === true)"
        />
      </v-card>
    </v-form>
  </v-dialog>
</template>
