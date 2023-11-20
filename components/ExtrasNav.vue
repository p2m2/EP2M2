<!--
    This module give access to help, profile, logout, home page 
 -->

<script setup lang="ts">
import { I } from "vitest/dist/types-198fd1d9";
import {ref, reactive, computed} from "vue";
import { useI18n, useSwitchLocalePath } from '#imports'
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
// Variable to access and modify to translate
const altHome = ref<string>("Accueil");
const altHelp = ref<string>("Aide");
const altTopProfOut = ref<string>("Accéder au sous-menu profile et déconnection");
const labProfile = ref<string>("Profile");
const labLogout = ref<string>("LogOut");

// Variable identify user
const user = reactive<{firstName: string, lastName: string}>({
    firstName : "Pierre",
    lastName : "Dupond"
});    

// Define submenu for user
const items = <object[]>[
    [{
        label: user.firstName + " " + user.lastName,
        icon: "i-heroicons-user",
        disabled: true
    }],
    [{
        label: labProfile.value,
        icon: "i-heroicons-adjustments-horizontal" 
    }],
    [{
        label: labLogout.value,
        icon: "i-heroicons-arrow-right-on-rectangle"
    }]
];

const avaiblesLang = computed(() => {
    return locales.value.filter((i) => i.code !== locale.value).
        map((i18n)=> [{
            label:i18n.name,
            to: switchLocalePath(i18n.code)
        }])
})    
    
console.log(avaiblesLang.value);

</script>

<style>
    .bgGreen{
        background-color: var(--greenP2M2);
    }

    .profileName {
        background-color: var(--greenP2M2);
        color: var(--orangeP2M2);
        cursor: default;
    }
</style>

<template>
    <UContainer class="float-right block">
        <UDropdown :items="avaiblesLang" mode="hover" 
                   :popper="{ placement: 'bottom-start' }">
            <UButton icon="i-heroicons-language" color="white" size="xl"
                     :title="t('button.lang.alt')"/>
        </UDropdown>
        <UButton icon="i-heroicons-home-modern" color="white" size="xl"
                 :title="altHome"/>
        <UButton icon="i-heroicons-light-bulb" color="white" size="xl"
                 :title="altHelp"/>

        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }"
                   :ui="{item: {disabled: 'profileName'}}"
                   :title="altTopProfOut">
            <UButton trailing-icon="i-heroicons-chevron-down-20-solid"
                     leading-icon="i-heroicons-user-20-solid"  size="xl"
                     color="white" class="bgGreen"/>
        </UDropdown>

    </UContainer>
</template>