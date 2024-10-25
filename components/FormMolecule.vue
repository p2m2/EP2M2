<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT

The file profile form molecule composant
-->
<script setup lang="ts">

const { t } = useI18n();

const props = defineProps({
    // id of molecule
    idMolecule:{
        type:String,
        default: '',
        required: false
    },
    // view mode of dialog box
    action:{
        type:String,
        default: 'add',
        required: true,
        validator: (value: string) => {
            return ['add', 'modify', 'view'].includes(value);
        }
    }
});

// Event to close dialog box
const event = defineEmits(['close']);

// Variable to manage the form
const validateForm = computed<boolean>(() => {
    return true;
});

/**
 * Define the title of dialog box
 */
function titleDialogBox(): string{
    if(props.action === 'add'){
        return t('title.addMolecule');
    }else if(props.action === 'modify'){
        return t('title.modifyMolecule');
    }else{
        return t('title.viewMolecule');
    }
}

/**
 * Define the subtitle of dialog box
 */
function subtitleDialogBox(): string{
    if(props.action === 'add'){
        return "";
    }else{
        return "name of molecul";
    }
}

/**
 * Add molecule
 */
function add(){
    // TODO
    event('close');
}
/**
 * Update molecule
 */
function update(){
    // TODO
    event('close');
}
</script>

<template>
  <v-form
    v-model="validateForm"
    validate-on="blur"
    persistent
    :disabled="props.action === 'view'"
    @submit.prevent="props.action === 'modify' ? update : add"
  >
    <v-card>
      <!-- title of dialog box about action -->
      <v-card-title class="d-flex justify-space-between">
        <span class="headline">{{ titleDialogBox() }}</span>
        <!-- button to close dialog box and cancel action -->
        <!-- TODO manage when we cancel msg confirmation-->
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="event('close')"
        />
      </v-card-title>
      <v-card-subtitle class="text-h4">
        {{ subtitleDialogBox() }}
      </v-card-subtitle>


      <v-expansion-panels>
        <!-- Tab where define on whose machine apply calibration curve -->
        <v-expansion-panel
          :title="t('title.molecule')"
          disabled
        >
          <v-expansion-panel-text>
            helle
          </v-expansion-panel-text>
        </v-expansion-panel>
        <!-- Tab where define equivalent molecul -->
        <v-expansion-panel
          :title="t('title.equivalent')"
          disabled
        >
          <v-expansion-panel-text>
            helle
          </v-expansion-panel-text>
        </v-expansion-panel>
        <!-- Tab where define synonyms -->
        <v-expansion-panel
          :title="t('title.synonyms')"
          disabled
        >
          <v-expansion-panel-text>
            helle
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <!-- Button to save/close dialog box -->
      <v-btn
        v-if="props.action === 'view'"
        color="primary"
        :text="t('button.close')"
        @click="event('close')"
      />
      <v-btn
        v-else-if="props.action === 'modify'"
        color="primary"
        :text="t('button.modify')"
        :disabled="!(validateForm === true)"
        type="submit"
      />
      <v-btn
        v-else
        color="primary"
        :text="t('button.save')"
        type="submit"
        :disabled="!(validateForm === true)"
      /> 
    </v-card>
  </v-form>
</template>