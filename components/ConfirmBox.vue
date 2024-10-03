<!--
Copyright © 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<script setup lang="ts">

// token to save the state of the dialog box
const openConfirmBox = useState<boolean>("openConfirmBox", () => false);
// message to display in the dialog box
const msgConfirmBox = useState<string>("msgConfirmBox", () => "");
// token to save the answer of the dialog box
const answerConfirmBox = useState<boolean>("answerConfirmBox", () => false);
// function to internationalize the text
const {t} = useI18n();

</script>

<template>
  <!-- Confirm Box -->
  <v-dialog
    id="confirm-box"
    v-model="openConfirmBox"
    max-width="40%"
  >
    <v-card>
      <!-- title of confirm box -->
      <v-card-title>{{ t('title.confirmBox') }}</v-card-title>
      <!-- message of confirm box -->
      <v-card-text>{{ msgConfirmBox }}</v-card-text>
      <v-card-actions>
        <!-- buttons of confirm box -->
        <!-- NO or cancel  -->
        <v-btn
          :text="t('button.cancel')"
          @click="openConfirmBox = false; answerConfirmBox = false"
        />
        <!-- YES or ok -->
        <v-btn
          :text="t('button.yes')"
          @click="openConfirmBox = false; answerConfirmBox = true"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>