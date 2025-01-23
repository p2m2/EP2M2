<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<!-- 
  This file manage help button 
 -->

 <script setup lang="ts">
const {t} = useI18n()
const contextualHelp = useState<boolean>("contextual", () => false);

contextualHelp.value = false;

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
    <v-menu activator="parent">
      <v-list>
        <v-list-item>
          <v-list-item-title>
            <v-btn 
              :title="t('button.documentation')"
              variant="plain"
            >
              <v-icon>mdi-bookshelf</v-icon>
              <span>{{ t('button.documentation') }}</span>
            </v-btn>
          </v-list-item-title>
          <v-list-item-title>
            <v-btn 
              :title="t('button.contextual')" 
              variant="plain"
              @click="contextualHelp = true"
            >
              <v-icon>mdi-information-box</v-icon>
              <span>{{ t('button.contextual') }}</span>
            </v-btn>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-btn>
</template>