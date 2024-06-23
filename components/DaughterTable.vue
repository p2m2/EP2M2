<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<!-- 
    This component display in light version the table of metabolites of a serie
    of each daughter solution. It provide a input to indicate the expected area.
    It is used in ManageSerie.async.vue
 -->

<script setup lang="ts">
// to manage translation
const { t } = useI18n();

// Define daughter solution metabolites table
// -- inputs information
const model = defineModel<{
  idFile:string,
  nameFile:string,
  nameMeta:string,
  area:number,
  expectedArea:number}[]>({ required: true });
// -- headers of the table
const headers = ref([
    { title: t('nameMeta'), sortable:true, key: 'nameMeta' },
    { title: t('area'), sortable:true, key: 'area' },
    { title: t('expectedArea'), sortable:true, key: 'expectedArea' },
    { title: t('delete'), key: 'del' },
]);
// -- group by daughter solution
const groupBy = ref([{ title: t('nameFile'), sortable:true, key: 'nameFile' }]);


/**
 * Delete a daughter file
 * @param nameFile name of the daughter file to delete
 */
function delDaughterFile(nameFile: string) {
    model.value = model.value.filter((item) => item.nameFile !== nameFile);
}

</script>

<template>
  <v-data-table-virtual
    v-model:items="model"
    :headers="headers"
    :group-by="groupBy"
    item-key="nameMeta"
  >
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
          {{ item.value }}
          <!-- button to delete the group -->
          <v-icon @click="delDaughterFile(item.value)">
            mdi-delete
          </v-icon>
        </td>
      </tr>
    </template>
    <!-- input for expected area -->
    <template #[`item.expectedArea`]="{index}">
      <v-text-field
        v-model="model[index].expectedArea"
        type="number"
        variant="plain"
        :rules="[(v) => v >= 0 || t('message.positiveNumber')]"
      />
    </template>
  </v-data-table-virtual>
</template>
