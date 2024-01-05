<script setup lang="ts">
const { t } = useI18n();
const props = defineProps({
    nameTable: {
        type:String,
        required:true
    }
});
console.log(props.nameTable);
const structTable = await $fetch("/api/manageControl/header",{
    method:"post",
    body:{nameTable:props.nameTable}
});

structTable.push({key:"action"});

const nbPage = await $fetch("/api/manageControl/nbPages",{
    method:"post",
    body:{nameTable:props.nameTable}
});

const items = await $fetch("/api/manageControl/getPage",{
    method:"post",
    body:{nameTable:props.nameTable}
});

const totalItems = await $fetch("/api/manageControl/totalItems",{
    method:"post",
    body:{nameTable:props.nameTable}
});

</script>

<template>
  <v-data-table-server
    :headers="structTable"
    :items="items"
    :items-length="totalItems"
  >
    <template #headers="{ columns, isSorted, getSortIcon, toggleSort }">
      <tr>
        <template
          v-for="column in columns"
          :key="column.key"
        >
          <td>
            <span
              class="mr-2 cursor-pointer"
              @click="() => toggleSort(column)"
            >{{ t("header."+column.key) }}</span>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)" />
            </template>
          </td>
        </template>
      </tr>
    </template>
    <template #item.action="{ item }">
      <v-btn
        density="compact"
        icon="mdi-pen"
        color="green"
        @click="console.log(item)"
      />
      <v-btn
        density="compact"
        icon="mdi-trash-can"
        color="red"
        @click="console.log(item)"
      />
    </template>
  </v-data-table-server>
</template>