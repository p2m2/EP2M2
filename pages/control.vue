<!--
    This page provide manage of compound control
 -->

<script lang="ts">
import banner from "~/components/BannerMain.vue";
import extras from "~/components/ExtrasNav.vue";
import extract from "~/components/ExtractInfo.vue";
import login from "~/components/LoginForm.vue";
import bug from "~/components/BugButton.vue";
import { useCookie } from "nuxt/app";

export default{
    components:{
        login,
        banner,
        extras,
        extract,
        bug
    },
    data(){
        return {checkSession: false};
    },
    created:async function() {
        const token = useCookie("token",{sameSite:"strict"});
        const team = useCookie("team",{sameSite:"strict"});
 
        if (!token.value || !team.value){
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
    },
};

</script>

<template>
  <UCard> 
    <UNotifications />
    <template
      v-if="checkSession" 
      #header
    >
      <UContainer class="flex justify-between">
        <banner />
        <extras link-to="" />
      </UContainer>
    </template>
  
    <template
      v-else
      #header
    >
      <UContainer class="flex justify-between">
        <banner />
      </UContainer>
      <login />
    </template>
      
    <extract v-if="checkSession" />
    <!-- <bug v-else /> -->
    <template 
      
      #footer
    >
      <bug />
    </template>
  </UCard>
</template>