<!--
    This module give access to help, profile, logout, home page 
 -->

<script setup lang="ts">
import lang from "~/components/LangButton.vue";
import {reactive} from "vue";
// import { useI18n } from "#imports";
const { t } = useI18n();

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
        label: t("label.profile"),
        icon: "i-heroicons-adjustments-horizontal" 
    }],
    [{
        label: t("label.logout"),
        icon: "i-heroicons-arrow-right-on-rectangle"
    }]
];

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
        <lang/>
        <UButton icon="i-heroicons-home-modern" color="white" size="xl"
                 :title="t('button.home')"/>
        <UButton icon="i-heroicons-light-bulb" color="white" size="xl"
                 :title="t('button.help')"/>

        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }"
                   :ui="{item: {disabled: 'profileName'}}"
                   :title="t('button.topProfOut')">
            <UButton trailing-icon="i-heroicons-chevron-down-20-solid"
                     leading-icon="i-heroicons-user-20-solid"  size="xl"
                     color="white" class="bgGreen"/>
        </UDropdown>

    </UContainer>
</template>