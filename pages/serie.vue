<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This page provide manage of compound control
 -->

<script setup lang="ts">
import { useCookie } from "nuxt/app";
import type { LayoutKey } from "#build/types/layouts";

definePageMeta({
  layout: false,
});

const {t} = useI18n();
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
const tab = ref();

</script>

<template>
  <NuxtLayout :name="nameLayout">
    <UCard> 
      <UNotifications />
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

          <db-compound-show-list
            v-if="tab=='reference'"
            name-table="compound"
          />
          <db-machine-show-list
            v-if="tab=='machine'"
            name-table="machine"
          />
          <db-fitting-show-list
            v-if="tab=='fitting'"
          />
        </div>
      </UContainer>
    </UCard>
  </NuxtLayout>
</template>