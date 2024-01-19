<!--
SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->
<!-- Button to send email if we have a bug -->
<template>
  <!-- Button from NuxtUI -->
  <UButton
    to="mailto:p2m2-it@inrae.fr?subject=retour tamama (ep2m2)"
    target="_blank"
    icon="i-heroicons-bug-ant-solid"
    color="purple"
  >
    {{ $t('message.addIssue') }}
  </UButton>
</template>