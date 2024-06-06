<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file contain the componant root of application ep2m2.
  EP2M2 provide web wide to extract all information from raw files of 
  metabolomic engines.

 -->
<script setup lang="ts">
import type { LayoutKey } from '#build/types/layouts';

// use naviage layout whose call default layout
definePageMeta({
  layout: false ,
});
const nameLayout = ref<LayoutKey>('navigate-layout');

</script>

<template>
  <NuxtLayout :name="nameLayout">
    <extract-info />
  </NuxtLayout>
</template>

