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

/**
 * Open the dialog box to add a project
 * @function add
 * @memberof ManageProject
 * @returns {void}
 */
function add(){
  console.log('add project');
  
}

/**
 * Open the dialog box to view a project
 * @function view
 * @memberof ManageProject
 * @param {any} item - The project to view
 * @returns {void}
 */
function view(item: any){
  console.log('view project');
}

/**
 * Open the dialog box to modify a project
 * @function modify
 * @memberof ManageProject
 * @param {any} item - The project to modify
 * @returns {void}
 */
function modify(item: any){
  console.log('modify project');
}

</script>

<template>
  <!-- Display project and action on them -->
  <table-db-action 
    name-db-table="view_project"
    :add="add"
    :view="view"
    :modify="modify"
    :update="dialogView"
  />
</template>