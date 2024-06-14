<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<script setup lang="ts">

const { t } = useI18n();
const dialog = ref<boolean>(false);


const nameRules = [
  (v: string) => !!v || t("message.required"),
  (v: string) => (v && v.length <= 3) || t("message.max10"),
];
const nameSerie = ref<string>("");

/**
 * Add a new serie
 */
function add() {
  console.log("add");
  dialog.value = true;
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
      validate-on="lazy blur"
    />
    <v-card>
      <v-card-title>
        <span class="headline">Add a new serie</span>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="nameSerie"
          :counter="10"
          :rules="nameRules"
          label="t('label.nameSerie')"
          hide-details
          required
        />
      </v-card-text>

      <v-expansion-panels>
        <v-expansion-panel
          :title="t('title.machine')"
        >
          <v-expansion-panel-text>
            helle 
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel
          :title="t('title.mother')"
        >
          <v-expansion-panel-text>
            helle 
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel
          :title="t('title.daughter')"
        >
          <v-expansion-panel-text>
            helle 
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn
        color="primary"
        text="Save"
        @click="dialog = false"
      />
    </v-card>
  </v-dialog>
</template>