<!--
© 2025 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT

@file FormProject.vue

@description This Vue component manage files of a project 

@component FileProjectTable

-->
<script setup lang="ts">
import type { tFile } from "../plugins/file";

const model = defineModel<tFile[]>({ required: true });
const props = defineProps({
  // temporary folder to store files
  tmpFolder: {
    type: String,
    default: '',
    required: true
  },
});

const { t } = useI18n();
const { error } = useMessage();
const loading = ref<boolean>(false)
const fileProject = ref<File[] | null>(null);
const showFiles = ref<tFile[]>([]);
const headers = [
  { title: t('header.name'), value: 'name' },
  { title: t('header.size'), value: 'size' },
  { title: t('header.type'), value: 'type' },
  { title: t('header.action') },
];

/**
 * Check if all project files are valid
 * @param inFiles list of files
 */
function checkFiles(inFiles: tFile[]): boolean {
  for (const tmpfile of inFiles) {
    if (tmpfile.type === 'unknown' || tmpfile.size === 0) {
      return false;
    }
  }
  return true;
}


watch(fileProject, () => {
  infoFiles();
});

/**
 * Ask the server type of files
 * @function infoFiles
 * @returns {Promise<void>}
 */
async function infoFiles(): Promise<void> {
  
  // event.preventDefault();
  // Check if we have a file
  if (!fileProject.value) {
    return;
  }

  // check if some files are selected
  if (fileProject.value.length === 0) {
    error(t('message.noFile'));
    return;
  }

  // send files to the server
  loading.value = true;
  // - Put file in a FormData object to send all format file 
  //   (ex: csv, xls, xlsx, ...)
  const formData = new FormData();
  formData.append('folder', props.tmpFolder);
  console.log(fileProject.value);

  fileProject.value.map((file) => formData.append('file', file));
  // - send file to the server
  const result = await $fetch('/api/infoFile', {
    method: 'POST',
    body: formData,
  });

  // check if the file is empty or not a valid file
  if (typeof result === 'number' || result.length === 0) {
    error(t('message.errorFile'));
    return;
  }

  // advice user if some files are not valid
  if (!checkFiles(result)) {
    error(t('message.someInvalidFile'));
  }

  // Update table of files
  showFiles.value.push(...result);

  // reset file input
  fileProject.value = null;
  loading.value = false;
}

/**
 * delete a file from the list
 * @function deleteFile
 * @param item element to delete
 */
function deleteFile(item: tFile): void {
  showFiles.value = showFiles.value.filter((file) => file.id !== item.id);
}

/**
 * Provide the list of files to the parent component
 */
watch(showFiles, () => {  
  // keep only valid files
  model.value = showFiles.value.filter(
                       (file) => file.type !== 'unknown' && file.size !== 0);
},
// can watch all modifications of showFiles
{ deep: 1 });
</script>

<template>
  <!-- When clic on button, it active tag v-file-input-->
  <v-btn 
    variant="plain"
    :loading="loading"
    @click.stop="() => $refs.fileProjectInput.click()"
  >
    <!-- Get file with a watcher whose run infoFile -->
    <v-file-input
      ref="fileProjectInput"
      v-model="fileProject"
      multiple
      hide-input
      :disabled="loading"
    />
    {{ t('label.addFile') }}
  </v-btn>
  <v-data-table
    :headers="headers"
    :items="showFiles"
    :items-per-page="5"
    :no-data-text="t('message.noProjectFile')"
  >
    <template #item="{ item }">
      <tr :class="{'text-decoration-line-through': item.type === 'unknown' || item.size === 0}">
        <td>{{ item.name }}</td>
        <td>{{ item.size }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-btn
            icon
            variant="plain"
            @click="deleteFile(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>