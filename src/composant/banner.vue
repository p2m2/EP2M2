<!-- 
    This module provide banner of site
 -->
<script setup lang="ts">
    import {ref} from 'vue'

    const altBanner = ref<string>('icône EPM2M2');
    

</script>

<template>
    <header>
        <img src="../ressource/image/banner.png" :alt="altBanner">
    </header>
</template>