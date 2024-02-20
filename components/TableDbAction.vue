<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This component display a table from database table or view whitout column 
    id.
    It provide in option 5 actions: Add / Delete / Archive / Modify / View
    Actions are props. The use give a function. We call all function except 
    add with object containt information of item {key=>name of field in 
    database, value}. Add function called without parameter.

-->

<script setup lang="ts">
import tabledb from "./TableDb.vue";
// define props (input) of component
const props = defineProps({
    // Name of database table showed
    nameDbTable:{
        type:String,
        required:true
    },
    // Number line per page
    itemsPerPage:{
        type:Number,
        default: 10,
        required: false
    },
    // define actions
    // thx: https://github.com/vuejs/rfcs/discussions/397#discussioncomment-7745658
    // add
    add:{
        type:Function||null,
        default: null,
        required: false
    },
    //view function
    view:{
        type:Function||null,
        default: null,
        required: false
    },
    //modify function
    modify:{
        type:Function||null,
        default: null,
        required: false
    },
    //archive function
    archive:{
        type:Function||null,
        default: null,
        required: false
    },
    // delete function
    delete:{
        type:Function||null,
        default: null,
        required: false
    },
});
// For internationalization
const { t } = useI18n();

// Define no-add actions and its icon
const actIco : {name:string, ico:string}[] = [];
for(const action of Object.keys(props)){       
    // Check if event that one no-add action define 
    // thx https://stackoverflow.com/a/6000009
    // thx AI VueMastery.com
    if (typeof props[action as keyof typeof props] === "function"){  
        // Add column action  
        switch (action) {
        case "view":
            actIco.push({name:"view",ico:"mdi-eye"});
            break;
        case "modify":
            actIco.push({name:"modify",ico:"mdi-pencil"});
            break;
        case "archive":
            actIco.push({name:"archive",ico:"mdi-archive"});
            break;
        case "delete":
            actIco.push({name:"delete",ico:"mdi-delete"});
            break;
        }
    }

}
// Add action column if we need
let addColumn:tColumns|undefined= undefined;
if(actIco.length>0){
    addColumn={columns:[{key:"action", sortable:false, type:""}]};
}
</script>

<template>
  <tabledb 
    :name-db-table="props.nameDbTable" 
    :items-per-page="props.itemsPerPage"
    :add-column="addColumn"
  >
    <!-- Put add button on top of table -->
    <template
      v-if="props.add"
      #top
    >
      <v-toolbar flat>
        <v-btn
          prepend-icon="mdi-plus"
          @click="props.add()"
        >
          {{ t('button.add' + nameDbTable) }}
        </v-btn>
      </v-toolbar>
    </template>
    <!-- Put all actions with buttun and ico -->
    <template
      #[`item.action`]="item"
    >
      <!-- <div class="d-flex align-center flex-column pa-6"> -->
      <v-container>
        <v-row no-gutters>
          <v-col
            v-for="action in actIco"
            :key="action.name"
            :title="t(`button.${action.name}`)"
          >
            <!-- <v-btn-toggle>
                <div> -->
            <!-- we give to function all information on item -->
            <v-btn
              :icon="action.ico"
              density="compact"
              size="small"
              variant="text"
              @click="(props[action.name as keyof typeof props] as Function) (item)"
            />
            <!-- </div>
              </v-btn-toggle> -->
          </v-col>
        </v-row>
      </v-container>
      <!-- </div> -->
    </template>
  </tabledb>
</template>

