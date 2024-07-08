

<script setup lang="ts">
const stateMessage = useState("stateMessage", () => {return {
  actif:false,
  type : undefined,
  message: ""}
})
const timeout = -1
</script>

<template>
  <v-snackbar
    v-model="stateMessage.actif"
    :timeout="timeout"
  >
    <v-alert
      v-model="stateMessage.actif"
      :type="stateMessage.type"
      closable
      :text="stateMessage.message"
    />
  </v-snackbar>
</template>