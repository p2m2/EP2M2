 <!-- This module provide banner of site -->
<script setup lang="ts">
// import { useI18n } from "#imports";
const { t } = useI18n();
  

</script>

<template>
  <UContainer class="float-left block">
    <img
      :src="t('image.banner.src')"
      :alt="t('image.banner.alt')"
    >
  </UContainer>
</template>