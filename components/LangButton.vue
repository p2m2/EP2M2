<!-- 
  This file contain 

 -->

<script setup lang="ts">
import {computed} from "vue";
import { useI18n, useSwitchLocalePath } from "#imports";
const { t, locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const avaiblesLang = computed(() => {
    return locales.value.filter(i => (i.code) !== locale.value).
        map((i18n)=> [{
            label:i18n.name,
            to: switchLocalePath(i18n.code)
        }]);
});  

</script>

<template>
  <UDropdown 
    :items="avaiblesLang"
    mode="hover" 
    :popper="{ placement: 'bottom-start' }"
  >
    <UButton
      icon="i-heroicons-language"
      color="white"
      size="xl"
      :title="t('button.lang')"
    />
  </UDropdown>
</template>