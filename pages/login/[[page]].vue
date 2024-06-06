<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!--
    This page provide login
 -->
<script setup lang="ts">
// get page name to back after login
const route = useRoute()

</script>

<template>
  <login-form :redirect-page="route.query.page || '/'" />
</template>