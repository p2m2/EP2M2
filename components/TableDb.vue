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
        type:Object as PropType<tColumns>,
        default(){
            return {columns: []};
        },
        required:false
    },
    // ask update table: just toggle update variable in parent component
    update:{
        type:Boolean,
        default:false,
        required:false
    }
});
// get function to translate
const { t } = useI18n();

// global variable
// add reactivity on update props
const rfUpdate = toRef(props, "update");
// Get Number of items in table
const gtotalItems = ref<number>(0);

// Number items showed
const rfItemsPerPage = ref<number>(props.itemsPerPage);
// Page of table
const rfCurrentPage = ref<number>(1);
// manage sorted
const rfSortBy = ref<tOneSort[]>();
// Loading state of table
const rfLoading = ref<boolean>(false);
// Define of struct of table 
const tableStruct = ref< tHeader[]>([]);
// list of items
const rfItems = ref<object[]>([]);
// variable to block two load data when create component
let block:number = 0;


onMounted(async () => {
    // Get Number of items in table
    gtotalItems.value = await $fetch("/api/manageControl/totalItems",{
        method:"post",
        body:{nameTable:props.nameDbTable}
    });
    // Get struct of table 
    tableStruct.value = await $fetch("/api/manageControl/header",{
        method:"post",
        body:{nameTable:props.nameDbTable}
    });

    // Add columns in structur of table
    if(props.addColumn.columns.length > 0 && props.addColumn?.columns.length>0){
        for(const column of props.addColumn.columns){
            tableStruct.value.push(column);
        } 
    }
});


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
    // increase variable to indicate we get data one time
    if(block < 2){
        block++;
    }
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

// When user change update prop we update table
watch(
    rfUpdate,
    async() => {
        // Check we aren't in case of create component
        if(block == 2){
            rfItems.value = await getItems();
        }
        else{
            // increase variable to indicate we pass in first time during 
            // creation
            block++;
        }
    },
    // watch execute immediately
    { immediate: true }
);

</script>

<template>
  <v-data-table-server
    :headers="tableStruct"
    :items="rfItems"
    :items-length="gtotalItems"
    :items-per-page="rfItemsPerPage"
    :loading="rfLoading"
    @update:options="actualize"
  >
    <!-- Give access to top of table -->
    <template #top>
      <slot name="top" />
    </template>
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
            <!-- Click effect only if column is sortable -->
            <div
              class="flex items-center"
              @click="() => column.sortable?toggleSort(column):0"
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
      #[`item.${column.key}`]="{item}"
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

