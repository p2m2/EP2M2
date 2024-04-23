<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file contain the componant root of application ep2m2.
  EP2M2 provide web wide to extract all information from raw files of 
  metabolomic engines.

 -->
<script setup lang="ts">
import { useCookie } from "nuxt/app";
import type { LayoutKey } from "#build/types/layouts";

definePageMeta({
  layout: false,
});
const nameLayout = ref<LayoutKey>('default');
const checkSession = ref(false);
const token = useCookie("token",{sameSite:"strict"});
const team = useCookie("team",{sameSite:"strict"});

if (!token.value || !team.value){
    checkSession.value = false;
}
else{
  const data  = await $fetch("/api/checkToken", {
      method: "POST",
      headers:{
          "Content-Type":"text/plain"
      },
      body: token.value.toString()
  });

  if (data){
    checkSession.value = true;
    nameLayout.value ='navigate-layout';
  }
  
}

</script>

<template>
  <NuxtLayout :name="nameLayout">
    <extract-info v-if="checkSession" />
    <login-form v-else />
  </NuxtLayout>
</template>

<style>
  :root{
    --greenP2M2: #B3D870;
    --blueP2M2: #243271;
    --orangeP2M2: #E17F21;
  }
  /* html {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 2%;
    overflow-x: hidden;
    min-height: 100vh;
    align-items: flex-start;
  }

  * {
    box-sizing: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  } */

  /* .header {
    display: flex;
    justify-content: space-between;
  }

  header {
    float: left;
    display:block;
  }

  nav {
    float: right;
    display: block;
  } */

</style>
