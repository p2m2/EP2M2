<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file contain a button to change the language of web site
 -->
<script setup lang="ts">

const { locale, locales, setLocale} = useI18n();

// get list of avaible language
// return {name:string, code:string}[]
const avaiblesLang = computed(() => {
    return locales.value.filter(i => {
        if (typeof(i) != "string"){
            // get all language instead of actual it
            if((i.code) !== locale.value){
                return i;
            }
        }
    // extract name of language and its code
    }).map((i18n)=> {
        if (typeof(i18n) != "string"){
            return {
                label:i18n.name as string,
                to: i18n.code as string
            };
        }
    });
});

</script>

<template>
  <v-btn>
    <v-icon
      icon="mdi-translate"
    />
    <!-- Create a list menu down the translate button -->
    <v-menu activator="parent">
      <v-list>
        <v-list-item
          v-for="(item, index) in avaiblesLang"
          :key="index"
          :value="index"
        >
          <!-- When we click on button we change language -->
          <v-btn
            v-if="item"
            @click="setLocale(item.to)"
          >
            {{ item.label }}
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-btn>
</template>