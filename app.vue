<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<template>
  <NuxtLayout>
    <Suspense>
      <NuxtPage />
    </Suspense>
  </NuxtLayout>
  <state-message />
  <confirm-box />
</template>