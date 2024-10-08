<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file manage logout button 
 -->

 <script setup lang="ts">
const {t} = useI18n()
</script>

<template>
  <v-btn
    class="ma-2 pa-2 bt-logout"
    size="x-large"
    prepend-icon="mdi-logout"
    variant="outlined"
    stacked   
    rounded="lg"
    :title="t('button.logout')"
  >
    <span class="text-subtitle-2">
      {{ t('button.logout') }} 
    </span>
  </v-btn>
</template>