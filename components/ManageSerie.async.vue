<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<script setup lang="ts">
import * as v from 'valibot';
const { t } = useI18n();
const dialog = ref<boolean>(false);
const validateForm = ref(false);


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
function add() {
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
      nameFile: daughterFile.value.name,
      nameMeta: r[0],
      area: r[1],
      expectedArea: 0,
  })));
  
  // reset file input
  daughterFile.value = null;
  rDaughterLoading.value = false;
}
</script>

<template>
  <table-db-action 
    name-db-table="view_serie" 
    :add="add"
  />
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-form
      v-model="validateForm"
      validate-on="lazy blur"
      @submit.prevent
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ t('title.addSerie') }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="nameSerie"
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
          :disabled="!(validateForm === true)"
          @click="dialog = false"
        />
      </v-card>
    </v-form>
  </v-dialog>
</template>