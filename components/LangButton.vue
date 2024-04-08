<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file contain 

 -->

 <script setup lang="ts">
 const { locale, locales, setLocale } = useI18n();
  
 const avaiblesLang = computed(() => {
     return locales.value.filter(i => (i.code) !== locale.value).
         map((i18n)=> {return {
             label:i18n.name,
             code: i18n.code
         };});
 });  
  
 function changeLang(code:string){
     setLocale(code);
 }
 
 </script>
  
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        size="x-large"
        icon="mdi-translate"
        variant="outlined"
        class="ma-2 pa-2"
      />
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in avaiblesLang"
        :key="i"
      >
        <v-btn
          v-if="item"
          @click="changeLang(item.code)"
        >
          {{ item.label }}
        </v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>