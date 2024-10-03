<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

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

<!-- 
  TODO maybe
  ask action function return 0 to update table
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
    // ask update table: just toggle update variable in parent component
    update:{
        type:Boolean,
        default:false,
        required:false
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

// define type of actions props
type typePropsAction = typeof props.add 
| typeof props.archive 
| typeof props.view  
| typeof props.modify 
| typeof props.delete;

// define type to use string as index of action props
type keyPropsAction = keyof typeof props

const rfUpdate = toRef(props, "update");
// For internationalization
const { t } = useI18n();

// Define no-add actions and its icon
const actIco : {name:string, ico:string}[] = [];
for(const action of Object.keys(props)){       
    // Check if event that one no-add action define 
    // thx https://stackoverflow.com/a/6000009
    // thx AI VueMastery.com
    if (typeof props[action as keyPropsAction] === "function"){  
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

/**
 * 
 * @param action 
 * @param item 
 */
function launchAction(action:{name:string}, item:object) {
    // define action function
    const func:typePropsAction = 
      props[action.name as keyPropsAction] as typePropsAction;
    // run action function
    func(item);
    // Update table for all action except view because this function haven't
    // effect on database
    if(action.name != "view"){
        rfUpdate.value = !rfUpdate.value;
    }
}
/**
 * Disable actions
 * Archive when item is archived
 * Delete when item is archived or used
 * Modify when item is archived or used
 * @param action string name of action
 * @param item {date_achieve?: any, used?: any} item information
 */
function disableAction(action:string,
                       item:{ date_achieve?: any, used?: any }):boolean{
    // View action is always available
    if(action == "view"){
        return false;
    }
    // Check if item is archived
    if(item.date_achieve){
        return true;
    }
    // Check if item is used
    if(item.used){
        return true;
    }
    return false;

}
</script>

<template>
  <tabledb 
    :name-db-table="props.nameDbTable" 
    :items-per-page="props.itemsPerPage"
    :add-column="addColumn"
    :update="rfUpdate"
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
              :disabled="disableAction(action.name, item)"
              @click="() => launchAction(action, item)"
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

