<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This page provide manage of series
 -->

<script setup lang="ts">
import type { LayoutKey } from '#build/types/layouts';

import type { ConcreteComponent } from "vue";

// use naviage layout whose call default layout
definePageMeta({
  layout: false ,
});
const nameLayout = ref<LayoutKey>('navigate-layout');

const {t} = useI18n();
const tab = ref("serie");
// define list of tabs
const listTab = ['machine', 'molecule', 'base', 'mother','mix','serie'];
// define list of components of tabs
const ListComp : {[key:string]: string | ConcreteComponent} = {
  machine:resolveComponent('lazy-ManageMachineAsync'),
  molecule:resolveComponent('lazy-ManageMoleculeAsync'),
  base:resolveComponent('lazy-ManageBaseAsync'),
  mother:resolveComponent('lazy-ManageMotherAsync'),
  mix:resolveComponent('lazy-ManageMixAsync'),
  serie:resolveComponent('lazy-ManageSerieAsync'),
};
</script>

<template>
  <NuxtLayout :name="nameLayout">
    <v-row>
      <v-col cols="2">
        <!-- Dispaly vertical tabs -->
        <v-tabs
          v-model="tab"
          direction="vertical"
        >
          <v-tab 
            v-for="tabName in listTab"
            :key="tabName"
            :value="tabName"
          >
            {{ t('tab.' + tabName) }}
          </v-tab>
        </v-tabs>
      </v-col>
      <v-col>
        <!-- Display content of each tab
             Each tab has a component -->
        <v-window
          v-model="tab"
        >
          <v-window-item
            v-for="tabName in listTab"
            :key="tabName"
            :value="tabName"
          >
            <component :is="ListComp[tabName]" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </NuxtLayout>
</template>