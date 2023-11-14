<!-- 
  This file contain the componant root of application ep2m2.
  EP2M2 provide web wide to extract all information from raw files of 
  metabolomic engines.

 -->

<script setup lang="ts">
import banner from "~/components/BannerMain.vue";
import extras from "~/components/ExtrasNav.vue";
import extract from "~/components/ExtractInfo.vue";
import login from "~/components/LoginForm.vue";
import { useCookie } from "nuxt/app";

</script>

<script lang="ts">
export default{
    data(){
        return {checkSession: false};
    },
    created:async function() {
        const token = useCookie("token");
 
        console.log("hein");
        console.log(token.value);
      
      
        if (!token.value){
            this.checkSession = false;
            return null;
        }


        this.checkSession = await $fetch("/api/checkToken", {
            method: "POST",
            headers:{
                "Content-Type":"text/plain"
            },
            body: token.value.toString()
        });
      
    }
};
</script>

<template>
  <UCard v-if="checkSession"> 
    <template #header>
      <UContainer class="flex justify-between">
        <banner />
        <extras />
      </UContainer>
    </template>
    
    <extract />
    
    <!-- <template #footer/> -->
  </UCard>
  <UCard v-else>
    <template #header>
      <UContainer class="flex justify-between">
        <banner />
      </UContainer>
      <login />
    </template>
  </UCard>
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
