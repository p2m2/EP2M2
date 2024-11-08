<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<script setup lang="ts">

const { t } = useI18n();
const {error, success} = useMessage();

// Variable to manage the dialog box
// to open or close the dialog box
const dialogView = ref<boolean>(false);
// to indicate state of the dialog box about asked action 
const action = ref<string>('');

// id molecule selected
const idMolecule = ref<string>('');

/**
 * Open the dialog box to add a molecule
 */
function add(){
  dialogView.value = true;
  action.value = 'add';
}

/**
 * Open the dialog box to view a molecule
 */
function view(item: any){
  dialogView.value = true;
  action.value = 'view';
  // give the id of the molecule to the form
  idMolecule.value = item.id;
}

/**
 * Open the dialog box to modify a molecule
 */
function modify(item: any){
  dialogView.value = true;
  action.value = 'modify';
  // give the id of the molecule to the form
  idMolecule.value = item.id;
}
</script>

<template>
  <table-db-action 
    name-db-table="view_tab_molecule"
    :add="add"
    :view="view"
    :modify="modify"
    :update="dialogView"
  />
  <v-dialog
    v-model="dialogView"
    max-width="600"
  >
    <form-molecule
      :action="action"
      :id-molecule="idMolecule"
      @close="dialogView = false"
    />
  </v-dialog>
</template>