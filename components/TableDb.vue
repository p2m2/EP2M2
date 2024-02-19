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
    // add column
    addColumn:{
        type:Object as PropType<tColumns>||null,
        default: null,
        required:false
    }
});

const { t } = useI18n();

// global variable
// Get Number of items in table
const gtotalItems = await $fetch("/api/manageControl/totalItems",{
    method:"post",
    body:{nameTable:props.nameDbTable}
});
// Number items showed
const rfItemsPerPage = ref<number>(props.itemsPerPage);
// Page of table
const rfCurrentPage = ref<number>(1);
// manage sorted
const rfSortBy = ref<tOneSort[]>();
// Loading state of table
const rfLoading = ref<boolean>(false);

// Define of struct of table 
const tableStruct = await $fetch("/api/manageControl/header",{
    method:"post",
    body:{nameTable:props.nameDbTable}
});

// list of items
const rfItems = ref(await getItems());


// Add columns in structur of table
if(props.addColumn && props.addColumn?.columns.length>0){
    for(const column of props.addColumn.columns){
        tableStruct.push(column);
    } 
}


/**
 * Get all list of items of one page and number of page
 * @param page number page
 */
function getItems(page: number = 1):Promise<object[]>{
    // change state of table in loading
    rfLoading.value= true;
    // set the number of page
    rfCurrentPage.value = page;
    return $fetch("/api/manageControl/getPage",{
        method:"post",
        body:{
            nameTable:props.nameDbTable,
            sortBy:rfSortBy.value,
            page:page,
            itemByPage:rfItemsPerPage.value
        }
    })
        .then((resp) => {
            rfLoading.value= false;
            return resp;
        })
        .catch(() => {
            rfLoading.value= false;
            return [];
        });

}

/**
 * Update item show onto table
 * @param param {page:number, itemsPerPage:number, sortBy:tOneSort[]}
 */
async function actualize({page, itemsPerPage, sortBy}:
{page:number,itemsPerPage:number,sortBy:tOneSort[]}) {
    // apply sort of row
    if(sortBy.length){    
        rfSortBy.value = sortBy;
    }
    // get number of items showed
    if(itemsPerPage){
        rfItemsPerPage.value = itemsPerPage;
    }
    // get list of items of page
    rfItems.value = await getItems(page);    
}

</script>

<template>
  <v-data-table-server
    :headers="tableStruct"
    :items="rfItems"
    :items-length="gtotalItems"
    :items-per-page="rfItemsPerPage"
    @update:options="actualize"
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
    <!-- Give user access to added colmn -->
    <template
      v-for="column of props.addColumn?.columns"
      #['item.'+column.key]="{item}"
    >
      <!-- thx: https://stackoverflow.com/a/53431262 -->
      <!-- Create slot with added column name -->
      <!-- Give all information of item -->
      <slot
        :name="'item.' + column.key"
        v-bind="item"
      />
    </template>
  </v-data-table-server>
</template>

