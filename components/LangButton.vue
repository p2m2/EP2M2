<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file manage language button 

 -->

 <script setup lang="ts">
 const { locale, t } = useI18n();
 const { locales, setLocale } = useNuxtApp().$i18n;

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
        prepend-icon="mdi-translate"
        variant="outlined"
        class="ma-2 pa-2 bt-lang"
        stacked
        rounded="lg"
        :title="t('button.lang')"
      >
        <span class="text-subtitle-2">
          {{ t('button.lang') }} 
        </span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="item in avaiblesLang"
        :key="item.code"
      >
        <v-btn
          v-if="item"
          :class="item.code"
          @click="changeLang(item.code)"
        >
          {{ item.label }}
        </v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>