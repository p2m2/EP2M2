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
    const labExtract = ref<string>('Extraire');

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
        transition: all 0.5s ease-out;
        cursor: pointer;
        text-align: center;
        justify-content: center;
    }

    .sizeBy3{
        width: 33%;
    }

    .sizeAlone{
        width: 10%;       
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
        <UButton class="extractButton sizeBy3" :title="labSelectFile">
            {{labSelectFile}}
        </UButton>
        <UButton class="extractButton sizeBy3" :title="labSelectDir">
            {{labSelectDir}}
        </UButton>
        <UButton class="extractButton sizeBy3" :title="labDeleteAll">
            {{labDeleteAll}}
        </UButton>
    </UContainer>
    <UContainer>
        <UTable :rows="files" :columns="columns"> 
            <template #delete-data="{row}">
                <UButton :title="labDeleteRow" icon="i-heroicons-x-mark" 
                         size="xl" color="red" variant="ghost"/>
            </template>
        </UTable>
    </UContainer>
    <UContainer>
        <UButton class="extractButton float-right block sizeAlone">
            {{ labExtract }}
        </UButton>
    </UContainer>
</template>