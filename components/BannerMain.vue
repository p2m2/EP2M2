<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- This module provide banner of site -->
<script setup lang="ts">
// import { useI18n } from "#imports";
/**
 * @type ComposerTranlation
 */
const { t } = useI18n();
  

</script>

<template>
  <UContainer class="float-left block">
    <!-- We change image about language-->
    <img
      :src="t('image.banner.src')"
      :alt="t('image.banner.alt')"
    >
  </UContainer>
</template>