<script setup lang="ts">

import { ref } from "vue";
import { string, object, email, minLength, Input } from "valibot";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";

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
    console.log(event.data);
    console.log(state);
    
    const result = await $fetch("/api/checkLogin", {
        method:"POST",
        body:{email:state.value.email, password:state.value.password}
    });

    console.log(result);
    
}

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

