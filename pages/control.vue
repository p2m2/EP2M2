<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This page provide manage of compound control
 -->

<script lang="ts">
import fit from "~/components/DbFittingShowList.vue";
import comp from "~/components/DbCompoundShowList.vue";
import machine from "~/components/DbMachineShowList.vue";
import banner from "~/components/BannerMain.vue";
import login from "~/components/LoginForm.vue";
import bug from "~/components/BugButton.vue";
import { useCookie } from "nuxt/app";

export default{
    components:{
        fit,
        machine,
        comp,
        login,
        banner,
        bug
    },
    data(){
        return {
            checkSession: false,
            tab: "reference"
        };
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
    methods:{
        t(params:string) {
            const {t} = useI18n();
            return t(params);
        }
    }
    
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
    <UContainer v-if="checkSession">
      <div class="d-flex flex-row">
        <v-tabs
          v-model="tab"
          direction="vertical"
        >
          <v-tab value="reference">
            <v-icon start>
              mdi-beaker-outline
            </v-icon>
            {{ t("tabs.reference") }}
          </v-tab>
          <v-tab value="machine">
            <v-icon start>
              mdi-washing-machine
            </v-icon>
            {{ t("tabs.machine") }}
          </v-tab>
          <v-tab value="fitting">
            <v-icon start>
              mdi-scale-balance
            </v-icon>
            {{ t("tabs.fitting") }}
          </v-tab>
        </v-tabs>

        <comp
          v-if="tab=='reference'"
          name-table="compound"
        />
        <machine
          v-if="tab=='machine'"
          name-table="machine"
        />
        <fit
          v-if="tab=='fitting'"
        />
      </div>
    </UContainer>

    <!-- <bug v-else /> -->
    <template 
      #footer
    >
      <bug />
    </template>
  </UCard>
</template>