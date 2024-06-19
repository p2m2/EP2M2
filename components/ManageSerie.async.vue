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

/**
 * Add a new serie
 */
function add() {
  console.log("add");
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

  await $fetch('/api/extractFromFile', {
    method: 'POST',
    body: daughterFile.value,
  });
  console.log("sendFile");
  console.log(daughterFile.value?.name);
  
}
</script>

<template>
  <table-db-action 
    name-db-table="view_serie" 
    :add="add"
  />
  <v-dialog
    v-model="dialog"
    max-width="600"
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
              <v-file-input
                v-model="daughterFile"
                :label="t('label.daughterFile')"
                :click:append="sendFile()"
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