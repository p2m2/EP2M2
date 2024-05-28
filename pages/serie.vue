<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This page provide manage of compound control
 -->

<script setup lang="ts">
import type { LayoutKey } from '#build/types/layouts';


// use naviage layout whose call default layout
definePageMeta({
  layout: false ,
});
const nameLayout = ref<LayoutKey>('navigate-layout');

const {t} = useI18n();
const tab = ref();

</script>

<template>
  <NuxtLayout :name="nameLayout">
    <UCard> 
      <UNotifications />
      <UContainer>
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