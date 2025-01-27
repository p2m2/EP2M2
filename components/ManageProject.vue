<!--
© 2025 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT

@file ManageProject.vue

@description This Vue component manage the projects of the application ep2m2.

@component ManageProject
-->

<script setup lang="ts">

const { t } = useI18n();
// variable to manage the dialog box
const dialogView = ref<boolean>(false);
// Indicate the action to do on the project
const action = ref<string>('');
// id project selected
const idProject = ref<string>('');

/**
 * Open the dialog box to add a project
 * @function add
 * @memberof ManageProject
 * @returns {void}
 */
function add(){
  action.value = 'add';
  dialogView.value = true;  
}

/**
 * Open the dialog box to view a project
 * @function view
 * @memberof ManageProject
 * @param {any} item - The project to view
 * @returns {void}
 */
function view(item: any){
  action.value = 'view';
  idProject.value = item.id;
  dialogView.value = true;
}

/**
 * Open the dialog box to modify a project
 * @function modify
 * @memberof ManageProject
 * @param {any} item - The project to modify
 * @returns {void}
 */
function modify(item: any){
  action.value = 'modify';
  idProject.value = item.id;
  dialogView.value = true;
}

/**
 * Delete a project
 * @function deleteProject
 * @memberof ManageProject
 * @param {any} item - The project to delete
 * @returns {void}
 */
function deleteProject(item: any){
  console.log('delete project');
}

/**
 * Archive a project
 * @function archive
 * @memberof ManageProject
 * @param {any} item - The project to archive
 * @returns {void}
 */
function archive(item: any){
  console.log('archive project');
}
</script>

<template>
  <!-- Display project and action on them -->
  <table-db-action 
    name-db-table="view_project"
    :add="add"
    :view="view"
    :modify="modify"
    :delete="deleteProject"
    :archive="archive"
    :update="dialogView"
  />
  <!-- Dialog Box display managed project  -->
  <v-dialog
    v-model="dialogView"
    max-width="600"
  >
    <form-project
      :action="action"
      :id-project="idProject"
      @close="dialogView = false"
    />
  </v-dialog>
</template>