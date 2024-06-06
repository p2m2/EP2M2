<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This file provide default layout
    This layout seen on all page
 -->
<script setup lang="ts">
const {t} = useI18n();
</script>

<template>
  <!-- mandatory tag to use vuetify in nuxt3 -->
  <v-app>
    <div>
      <v-container class="mb-4">
        <v-row justify="space-between">
          <!-- cliquable image of p2m2  -->
          <v-col class="bannerImage">
            <v-img
              aspect-ratio="16/9"
              :src="t('image.banner.src')"
              :alt="t('image.banner.alt')"
              :title="t('image.banner.title')"
              style="cursor: pointer;"
              @click="navigateTo('/')"
            />
          </v-col>
          <v-spacer />

          <!-- part to global buttons  -->
          <v-col
            align-self="start"
            class="bannerNav"
          >
            <v-row
              justify="end"
              class="ma-2 pa-8"
            >
              <lang-button />
              <help-button />
              <logout-button />
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <slot />
        </v-row>
      </v-container>
    </div>
    <v-footer>
      <bug-button />
    </v-footer>
  </v-app>
</template>