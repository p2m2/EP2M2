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
    main {
        padding-top: 1%;
    }

    .btGroup {
        display: flex;
        justify-content: space-around;
        padding: 1rem;
        align-items: center;
    }

    button {
        background-color: var(--greenP2M2);
        margin: 2px;
        padding: 1rem 2rem 1rem 2rem;
        border: 2px solid var(--blueP2M2);
        color: var(--blueP2M2);
        font-weight: bold;
        width: 30%;
        transition: all 0.5s ease-out;
        cursor: pointer;
    }

    button:hover,
    button:focus {
        background-color: var(--blueP2M2);
        color: var(--greenP2M2);
        border: 2px solid var(--greenP2M2);
    }

</style>

<template>
    <main>
        <div class="btGroup">
            <UButton color="green">
                {{labSelectFile}}
            </UButton>
            <UButton color="green">
                {{labSelectDir}}
            </UButton>
            <UButton color="green">
                {{labDeleteAll}}
            </UButton>
        </div>
        <div>
            <UTable :rows="files" :columns="columns" />
        </div>
    </main>
</template>