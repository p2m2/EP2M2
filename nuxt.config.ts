// https://nuxt.com/docs/api/configuration/nuxt-config
import {} from "nuxt";

export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        "@nuxt/ui",
    ],
    colorMode: {
        preference: "light"
    },
    pages:true
});
