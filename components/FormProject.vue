<!--
© 2025 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT

@file FormProject.vue

@description This Vue component manage the form to add, view or modify a project of the application ep2m2.

@component FormProject

-->
<script setup lang="ts">

import * as v from 'valibot';
import type { tFile, tProject } from "../plugins/file";

const { t } = useI18n();
const props = defineProps({
  // id of Project
  idProject: {
    type: String,
    default: '',
    required: false
  },
  // view mode of dialog box
  action: {
    type: String,
    default: 'add',
    required: true,
    validator: (value: string) => {
      return ['add', 'modify', 'view'].includes(value);
    }
  }
});

// Event to close dialog box
const event = defineEmits(['close']);

const loading = ref<boolean>(false)
const proDisplay = ref<tProject>({
    id : "",
    name : "",
    createDate : "",
    nbFile : 0,
    files : [] as tFile[],
    calibCurves : [],
});

// Rules for valid name calibration curve
const nameRules = ref([
  (value: string) => 
    useValibot(v.pipe(v.string(), v.nonEmpty(t('message.noEmpty'))),value),
]);

// Define temporary project folder
const tmpFolder = crypto.randomUUID();

/**
 * Submit the form
 */
function submitForm(){
  event("close");
}

/**
 * Title of dialog box
 * @function titleDialogBox
 * @memberof FormProject
 * @returns {string} - The title of dialog box
 */
function titleDialogBox(): string{
  switch(props.action){
    case 'modify':
      return t('project.modify');
    case 'view':
      return t('project.view');
    default:
      return t('project.add');
  }
}

/**
 * Text of submit button
 * @function submitBtnText
 * @memberof FormProject
 * @returns {string} - The text of submit button
 */
function submitBtnText(): string{
  switch(props.action){
    case 'modify':
      return t('button.modify');
    case 'view':
      return t('button.close');
    default:
      return t('button.add');
  }
}

/**
 * Delete a temporary file project
 */
function onBeforeUnmount(){
  console.log('onBeforeUnmount');
}

</script>

<template>
  <v-form
    validate-on="blur"
    persistent
    :disabled="props.action === 'view'"
    @submit.prevent="submitForm"
  >
    <v-card>
      <!-- title of dialog box about action -->
      <v-card-title class="d-flex justify-space-between">
        <span class="headline">{{ titleDialogBox() }}</span>
        <!-- button to close dialog box and cancel action -->
        <!-- TODO manage when we cancel msg confirmation-->
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="event('close')"
        />
      </v-card-title>
      <!-- Shom molecule -->
      <!-- its name -->
      <v-card-subtitle
        v-if="props.action !== 'add'"
        class="text-h4"
      >
        {{ proDisplay.name }}
      </v-card-subtitle>

      <!-- part name of project -->
      <v-text-field
        v-model="proDisplay.name"
        :label="t('label.name')"
        required
        :rules="nameRules"
      />
      <v-expansion-panels>
        <!-- part to manage metabo files -->
        <v-expansion-panel
          :title="t('label.files')"
        >
          <v-expansion-panel-text
            eager
          >
            <file-project-table
              v-model="proDisplay.files"
              :tmp-folder="tmpFolder"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <!-- part to manage calibration curves -->
        <v-expansion-panel
          :title="t('label.calibCurves')"
        >
          <v-expansion-panel-text
            eager
          >
            coucou
          </v-expansion-panel-text>
        </v-expansion-panel>  
      </v-expansion-panels>
    </v-card>

    <!-- Button to save/close dialog box -->
    <v-btn
      color="primary"
      :text="submitBtnText()"
      type="submit"
      :disabled="!(proDisplay.name)" 
    />
  </v-form>
</template>