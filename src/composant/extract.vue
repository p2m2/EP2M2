<!-- 
    This composant provide part to managa raw file from engine and extract all
    information.
 -->

<script setup lang="ts">
    const labSelectFile = ref<string>('Télécharger le(s) fichier(s)');
    const labSelectDir = ref<string>('Télécharger un dossier');
    const labDeleteAll = ref<string>('Tout supprimer');

    const labTableName = ref<string>('Nom');
    const labTableType = ref<string>('Type');
    const labTableSize = ref<string>('Taille');
    const labDeleteRow = ref<string>('supprimer');

    const columns = [{
        key: 'name',
        label: labTableName.value,
        sortable: true
    }, {
        key: 'type',
        label: labTableType.value,
        sortable: true
    }, {
        key: 'size',
        label: labTableSize.value,
        sortable: true
    }, {
        key: 'delete'
    }]

    const files = reactive<{name: string, type: string, size: number}[]>([{
        name: 'couc.txt',
        type: 'text',
        size: 5
    }, {
        name: 'rouc.jpg',
        type: 'image',
        size: 10
    }]);
</script>
    
<style>
    .extractButton {
        background-color: var(--greenP2M2);
        margin: 2px;
        padding: 1rem 2rem 1rem 2rem;
        border: 2px solid var(--blueP2M2);
        color: var(--blueP2M2);
        font-weight: bold;
        width: 33%;
        transition: all 0.5s ease-out;
        cursor: pointer;
        text-align: center;
    }

    .extractButton:hover,
    .extractButton:focus {
        background-color: var(--blueP2M2);
        color: var(--greenP2M2);
        border: 2px solid var(--greenP2M2);
    }
</style>

<template>
    
    <UContainer class="flex justify-around items-center">
        <UButton class="extractButton text-center">
            {{labSelectFile}}
        </UButton>
        <UButton class="extractButton">
            {{labSelectDir}}
        </UButton>
        <UButton class="extractButton">
            {{labDeleteAll}}
        </UButton>
    </UContainer>
    <UContainer>
        <UTable :rows="files" :columns="columns"> 
            <template #delete-data="{row}">
                <UButton icon="i-heroicons-x-mark" size="xl" color="red" variant="ghost"/>
            </template>
        </UTable>
    </UContainer>
</template>