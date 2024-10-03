<!--
© 2024 INRAE
SPDX-FileContributor: Marcellino Palerme <marcellino.palerme@inrae.fr>

SPDX-License-Identifier: MIT
-->

<script setup lang="ts">

import * as v from 'valibot'
import type { FormError, FormSubmitEvent } from '#ui/types'
import {useCookie } from "nuxt/app";

const props = defineProps <{
  redirectPage?: string
}>();

import { reactive } from 'vue'
const { t } = useI18n();

const schemaEmail= v.pipe(v.string(), v.email('Invalid email'));
const schemaPassword= v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters'));

const state = reactive({
  email: '',
  password: ''
})

const validate = (state: any): FormError[] => {

  const errors = [];

  try {
    v.parse(schemaEmail, state.email);
  } catch (e: unknown) {
    errors.push({ 
      path: "email",
      message: (e as v.ValiError<typeof schemaEmail>).message
    });
  }

  try {
    v.parse(schemaPassword, state.password);
  } catch (e: unknown) {
    errors.push({ 
      path: "password",
      message: (e as v.ValiError<typeof schemaPassword>).message
    });
  }

  return errors;
}

async function onSubmit (event: FormSubmitEvent<any>) {
   
    const result = await $fetch("/api/checkLogin", {
        method:"POST",
        body:{email:event.data.email, password:event.data.password}
    }) as number | string;

    if(typeof result == "string"){
      const today = new Date(Date.now());
      const expire = new Date(today.getFullYear(), today.getMonth(),
            today.getDate()+7);
      const token = useCookie("token", {expires:expire, sameSite: true});
      // We need to be HTTPS to use this line 
      // token.value = crypto.randomUUID();
      // TODO Be in HTTPS
      token.value = crypto.getRandomValues(new Uint32Array(4)).join("-");
      
      await $fetch("/api/AddToken", {
        method:"POST",
        body:{id:result, expire:expire, token:token.value}
      });

      const team = useCookie("team", {expires:expire, sameSite: true});
      team.value = result;
     
      await navigateTo(props.redirectPage || '/')
      return
    }
    
    window.location.reload();
}

</script>

<template>
  <UForm
    :validate="validate"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormGroup
      :label="t('label.email')"
      name="email"
    >
      <UInput v-model="state.email" />
    </UFormGroup>

    <UFormGroup
      :label="t('label.password')"
      name="password"
    >
      <UInput
        v-model="state.password"
        type="password"
      />
    </UFormGroup>

    <UButton type="submit">
      {{ $t('button.submit') }}
    </UButton>
  </UForm>
</template>

<style>

.form {
    justify-content: center;
    width: 50%;
}

</style>

