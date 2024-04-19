<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file manage help button 
 -->

 <script setup lang="ts">
const {t} = useI18n()
</script>

<template>
  <v-btn
    class="ma-2 pa-2 bt-help"
    size="x-large"
    prepend-icon="mdi-help"
    variant="outlined"
    stacked   
    rounded="lg"
    :title="t('button.help')"
  >
    <span class="text-subtitle-2">
      {{ t('button.help') }}
    </span>
  </v-btn>
</template>