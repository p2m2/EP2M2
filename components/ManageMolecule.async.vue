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

/**
 * Open the dialog box to add a molecule
 */
function add(){
  dialogView.value = true;
  action.value = 'add';
}

</script>

<template>
  <table-db-action 
    name-db-table="view_tab_molecule"
    :add="add"
  />
  <v-dialog
    v-model="dialogView"
    max-width="600"
  >
    <form-molecule
      :action="action"
      @close="dialogView = false"
    />
  </v-dialog>
</template>