<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This file provide navigate layout
    This layout provide to move between pages
 -->
<script setup lang="ts">
import { string } from 'valibot';

const {t} = useI18n();
const router = useRouter();
// Get name of all pages
const listPages = router.getRoutes().map(x => x.name) as string[];
//  Get name of current page
const currentPage = router.currentRoute.value.name;

function goToTab(namePage:string){

  let realPage = '/';

  if(namePage != 'index'){
    realPage = '/' + namePage;
  }

  navigateTo(realPage);
}
</script>

<template>  
  <!-- Show this layout in default layout -->
  <NuxtLayout name="default">
    <v-container>
      <v-card variant="plain">
        <!-- Navigation part -->
        <v-tabs bg-color="primary"> 
          <!-- Create one tab by page. When we click on we open the page -->
          <v-tab
            v-for="(pageName, index) in listPages.sort()"             
            :key="index"
            :value="pageName"
            @click="goToTab(pageName)"
          >
            <!-- Name of tab -->
            {{ t("page." + pageName) }} 
          </v-tab>
        </v-tabs>
        <v-card-text>
          <v-window>
            <!-- We show only tab contain of current page -->
            <v-window-item :value="currentPage">
              <slot />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-container>
  </NuxtLayout>
</template>