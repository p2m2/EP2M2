<script setup lang="ts">

import { ref } from "vue";
import { string, object, email, minLength, Input } from "valibot";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
// import createSession from "~/composables/createSession";
import {useCookie } from "nuxt/app";

console.log("a");


const schema = object({
    email: string([email("Invalid email")]),
    password: string([minLength(8, "Must be at least 8 characters")])
});

console.log("b");


type Schema = Input<typeof schema>

console.log("c");

const state = ref({
    email: undefined,
    password: undefined
});

console.log("d");


async function submit (event: FormSubmitEvent<Schema>) {
    // Do something with event.data
    console.log("coucou");
    
    console.log(event.data);
    
    const result = <number> await $fetch("/api/checkLogin", {
        method:"POST",
        body:{email:event.data.email, password:event.data.password}
    });

    console.log(result);

    if(result>0){
      const today = new Date(Date.now());
      const expire = new Date(today.getFullYear(), today.getMonth(),
            today.getDate()+7);
      const token = useCookie("token", {expires:expire, sameSite: true});
      token.value = crypto.randomUUID();
      
      await $fetch("/api/AddToken", {
        method:"POST",
        body:{id:result, expire:expire, token:token.value}
      });

    }
    window.location.reload();   
}

console.log("e");


</script>

<template>
  <UContainer class="flex justify-around items-center">
    <UForm 
      class="form"
      :schema="schema"
      :state="state"
      @submit="submit"
    >
      <UFormGroup 
        label="Email"
        name="email" 
      >
        <UInput v-model="state.email" />
      </UFormGroup>

      <UFormGroup
        label="Password"
        name="password"
      >
        <UInput
          v-model="state.password"
          type="password"
        />
      </UFormGroup>

      <UButton type="submit">
        Submit
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

