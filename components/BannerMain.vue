 <!-- This module provide banner of site -->
<script setup lang="ts">
import {ref} from "vue";

const altBanner = ref<string>("icône EPM2M2");
    

</script>

<template>
    <UContainer class="float-left block">
        <img src="/banner.png" :alt="altBanner">
    </UContainer>
</template>