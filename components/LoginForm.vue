<script setup lang="ts">
import lang from "~/components/LangButton.vue";
import { ref } from "vue";
import { string, object, email, minLength, type Input } from "valibot";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
// import createSession from "~/composables/createSession";
import {useCookie } from "nuxt/app";
import { useI18n } from "#imports";
const { t } = useI18n();

const schema = object({
    email: string([email("Invalid email")]),
    password: string([minLength(8, "Must be at least 8 characters")])
});

type Schema = Input<typeof schema>

const state = ref({
    email: undefined,
    password: undefined
});

async function submit (event: FormSubmitEvent<Schema>) {
    // Do something with event.data
    console.log("coucou");
    
    console.log(event.data);
    
    const result = <number> await $fetch("/api/checkLogin", {
        method:"POST",
        body:{email:event.data.email, password:event.data.password}
    });

    if(result>0){
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

    }
    window.location.reload();   
}

</script>

<template>
  <!-- [&>div]:justify-end Add to child div justify-end class -->
  <UContainer 
    class="flex justify-end w-1/2" 
  >
    <lang />
  </UContainer>
  <UContainer class="flex justify-around items-center">
    <UForm 
      class="form leading-loose"
      :schema="schema"
      :state="state"
      @submit="submit"
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
  </UContainer>
</template>

<style>

.form {
    justify-content: center;
    width: 50%;
}

</style>

