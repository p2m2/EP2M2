<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This file provide default layout
    This layout seen on all page
 -->
<script setup lang="ts">
const {t} = useI18n();
const runtimeConfig = useRuntimeConfig()
const lPartner = runtimeConfig.public.lPartner;
</script>

<template>
  <!-- mandatory tag to use vuetify in nuxt3 -->
  <v-app>
    <div>
      <v-container class="mb-4">
        <v-row
          justify="space-between"
          class="pb-12"
        >
          <v-col
            justify="space-between"
            align-self="center"
          >
            <v-row justify="space-between">
              <!-- cliquable image of p2m2  -->
              <v-col
                v-for="partner in lPartner.split(',')"
                :key="partner"
                class="d-flex child-flex"
              >
                <v-img
                  :src="t('image.banner.src.' + partner)"
                  :alt="t('image.banner.alt.' + partner)"
                  :title="t('image.banner.title')"
                  style="cursor: pointer;"
                  @click="navigateTo('/')"
                />
              </v-col>
            </v-row>
          </v-col>
          <!-- <v-spacer /> -->

          <!-- part to global buttons  -->
          <v-col
            align-self="start"
            class="bannerNav"
          >
            <v-row
              justify="end"
              class="ma-2 pa-2"
            >
              <lang-button />
              <help-button />
              <logout-button />
            </v-row>
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
          no-gutters
        >
          <slot />
        </v-row>
      </v-container>
    </div>
    <v-footer>
      <bug-button />
    </v-footer>
  </v-app>
</template>