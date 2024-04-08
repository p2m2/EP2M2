<script setup lang="ts">
const {t} = useI18n();
</script>

<template>
  <!-- mandatory tag to use vuetify in nuxt3 -->
  <v-app>
    <div>
      <v-container class="bg-white mb-4">
        <v-row justify="space-between">
          <!-- cliquable image of p2m2  -->
          <v-col class="ma-2 pa-8">
            <v-img
              aspect-ratio="16/9"
              :src="t('image.banner.src')"
              :alt="t('image.banner.alt')"
              style="cursor: pointer;"
              @click="navigateTo('/')"
            />
          </v-col>
          <v-spacer />

          <!-- part to global buttons  -->
          <v-col
            align-self="start"
          >
            <v-row
              justify="end"
              class="ma-2 pa-8"
            >
              <lang-button />
              <v-btn
                class="ma-2 pa-2"
                size="x-large"
                icon="mdi-help"
                variant="outlined"
              />
              <v-btn
                class="ma-2 pa-2"
                size="x-large"
                icon="mdi-logout"
                variant="outlined"
              />
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <slot />
        </v-row>
      </v-container>
    </div>
  </v-app>
</template>