<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
    This component display in light version the table of metabolites of a calibration curve
    of each daughter solution. It provide a input to indicate the concentration.
    It is used in ManageCalibCurve.async.vue
 -->

<script setup lang="ts">

// to manage translation
const { t } = useI18n();

const {error} = useMessage();

// Give possibility to pass in view mode
const props = defineProps({
  viewMode: {
    type: Boolean,
    default: false,
  },
});

// Define daughter solution metabolites table
// -- inputs information
const model = defineModel<{
  idFile:string,
  nameFile:string,
  nameMeta:string,
  area:number,
  concentration:number}[]>({ required: true });
// -- headers of the table
const headers = [
    { title: t('header.nameMeta'), sortable:true, key: 'nameMeta' },
    { title: t('header.area'), sortable:true, key: 'area' },
    { title: t('header.concentration'), sortable:true, key: 'concentration' },
];
// -- group by daughter solution
const groupBy = ref([{ sortable:true, key: 'idFile' }]);

// variable to manage loading
const loading = ref(false);

/**
 * Delete a daughter file
 * @param nameFile name of the daughter file to delete
 */
function delDaughterFile(idFile: string) {
    // Display loading
    loading.value = true;
    // Delete daughter file from server
    $fetch('/api/delFile', {
        method: 'POST',
        body: [idFile],
    })
    .then(()=>{
      // Delete daughter file from list
      model.value = model.value.filter((item) => item.idFile !== idFile);
    })
    .catch(() => {
      // Display error message
      error(t('message.error.deleteDaughterFile'));
    })
    .finally(() => {
      // Hide loading
      loading.value = false;
    });
}

</script>

<template>
  <!-- Display the table of metabolites group by daughter solution -->
  <v-data-table-virtual
    v-model:items="model"
    :loading="loading"
    :loading-text="t('message.loadingDaugtherTable')"
    :headers="headers"
    :group-by="groupBy"
    :no-data-text="t('message.noDaughterFile')"
    item-key="nameMeta"
  >
    <!-- Redefine name of header of groupe -->
    <template #[`header.data-table-group`]>
      {{ t('header.nameDaughterFile') }}
    </template>
    <!-- Redefine group header to delete a complely a daughter solution -->
    <template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
      <tr>
        <td :colspan="columns.length">
          <!-- Button to extend or collapse one group -->
          <v-btn
            :icon="isGroupOpen(item) ? '$expand' : '$next'"
            size="small"
            variant="text"
            @click="toggleGroup(item)"
          />
          <!-- show name file about ifFile -->
          {{ item.items[0].raw.nameFile }}
          <!-- button to delete the group -->
          <v-icon 
            :disabled="props.viewMode"
            @click="delDaughterFile(item.value)"
          >
            mdi-delete
          </v-icon>
        </td>
      </tr>
    </template>
    <!-- input for concentration -->
    <template #[`item.concentration`]="{index}">
      <v-text-field
        v-model="model[index].concentration"
        type="number"
        variant="plain"
        :rules="[(v) => parseFloat(v) >= 0 || t('message.positiveNumber')]"
      />
    </template>
    <template #loading>
      <v-skeleton-loader>
        <v-container align-self="center">
          {{ t('message.loadingDaugtherTable') }}
        </v-container>
      </v-skeleton-loader>
    </template>
  </v-data-table-virtual>
</template>
