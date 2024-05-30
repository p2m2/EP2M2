<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This file provide navigate layout
    This layout provide to move between pages
 -->
<script setup lang="ts">
// Get translate
const {t} = useI18n();
const router = useRouter();
// Get name of all pages without login
const listPages = router.getRoutes().map(x => x.name as string)
      .filter(x=> !x.startsWith('login'))
      .sort() as string[];

//  Get name of current page
const currentPage = router.currentRoute.value.name;
//  Get index of page to indicate to tabs which tab highlining
const currentIndex = ref(listPages.indexOf(currentPage as string))

/**
 * Function to change page. We manage case of page project.
 * This page has Index as name but to go this page the path
 * is /
 * @param namePage string Name of page
 */
function goToTab(namePage:string){
  let realPage = '/';

  // Check if we are in project page case
  if(namePage != 'index'){
    realPage = '/' + namePage;
  }

  // move to page
  navigateTo(realPage);
}
</script>

<template>  
  <!-- Show this layout in default layout -->
  <NuxtLayout name="default">
    <v-container>
      <!-- Navigation part -->
      <v-row>
        <v-col>
          <v-tabs 
            v-model="currentIndex"
            bg-color="primary"
            fixed-tabs
          > 
            <!-- Create one tab by page. When we click on we open the page -->
            <v-tab
              v-for="(pageName, index) in listPages"            
              :key="index"
              :value="pageName"
              @click="goToTab(pageName)"
            >
              <!-- Name of tab --> 
              {{ t("page." + pageName) }}
            </v-tab>
          </v-tabs>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <!-- part to show page -->
          <slot />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>