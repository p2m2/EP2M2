<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<script setup lang="ts">
import * as v from 'valibot';
const { t } = useI18n();
const dialog = ref<boolean>(false);
const validateForm = ref(false);
const rUpload = ref(false);

const nameRules = ref([
  (value: string) => 
    useValibot(v.pipe(v.string(), v.nonEmpty(t('message.noEmpty'))),value),
]);

const daughterFile = ref<File | null>(null);
const nameSerie = ref<string>("");
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
  // - TODO: show loading spinner
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

async function submit (event:SubmitEvent) { 
  
  // check if we have daughter solution
  // if (rDaughterTable.value.length === 0) {
  //   // TODO: show error message
  //   return;
  // }
  // Group value by file (daughter solution)
  console.log("plouf");
  
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
  console.log("0");
  
  // send serie name and all associated daughter solution 
  $fetch('/api/AddSerie', {
    method: 'POST',
    body: JSON.stringify({
      nameSerie: event?.target?.elements?.nameSerie.value,
      daughterGroup,
    }),
  })
  .then(() => {
    rUpload.value = !rUpload.value;
    console.log(1);
    
  })
  .catch(() => {
    console.log("error");
    // TODO: show error message
  });
}

</script>

<template>
  <table-db-action 
    name-db-table="view_show_serie" 
    :add="add"
    :update="rUpload"
  />
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-form
      v-model="validateForm"
      validate-on="lazy blur"
      @submit.prevent="submit"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ t('title.addSerie') }}</span>
        </v-card-title>
        <v-card-text>
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
          <v-expansion-panel
            :title="t('title.machine')"
            disabled
          >
            <v-expansion-panel-text>
              helle 
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel
            :title="t('title.mother')"
            disabled
          >
            <v-expansion-panel-text>
              helle 
            </v-expansion-panel-text>
          </v-expansion-panel>
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
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-btn
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