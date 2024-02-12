<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This component display a table from database table or view.
-->

<script setup lang="ts">

const props = defineProps({
    // Name of database table
    nameDbTable:{
        type:String,
        required: true
    },
    // Number line per page
    itemsPerPage:{
        type:Number,
        default: 10,
        required: false
    },
});

const { t } = useI18n();

// Define of struct of table 
const tableStruct = await $fetch("/api/manageControl/header",{
    method:"post",
    body:{nameTable:props.nameDbTable}
});

const items = await $fetch("/api/manageControl/rows",{
    method:"post",
    body:{
        wheres:{"1":"1"},
        nameTable:props.nameDbTable
    }
});
</script>

<template>
  <v-data-table-server
    :headers="tableStruct"
    :items="items"
    :items-length="items.length"
    :items-per-page="itemsPerPage"
  >
    <!-- Custom head of table -->
    <template
      #headers="{ 
        columns, isSorted, getSortIcon, toggleSort }"
    >
      <tr>
        <template
          v-for="column in columns"
          :key="column.key"
        >
          <td>
            <div
              class="flex items-center"
              @click="() => toggleSort(column)"
            >
              <v-btn
                variant="plain"
              >
                <!-- translate name of column -->
                {{ t("header."+column.key) }}
                <template
                  v-if="column.sortable"
                  #append
                >
                  <!-- display icon to indicate if column is sorted and
                       direction -->
                  <v-icon
                    :icon=" !isSorted(column)? 'mdi-arrow-up-down'
                      : getSortIcon(column) == '$sortAsc'? 'mdi-arrow-up'
                        :'mdi-arrow-down'"
                  />
                </template>
              </v-btn>
            </div>
          </td>
        </template>
      </tr>
    </template>
  </v-data-table-server>
</template>

