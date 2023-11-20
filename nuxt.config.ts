// https://nuxt.com/docs/api/configuration/nuxt-config
import {} from "nuxt";

export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        "@nuxt/ui",
        "@nuxtjs/i18n"
    ],
    colorMode: {
        preference: "light"
    },
    i18n: {
        locales: [
            {
                code: "en-US",
                name: "English (US)",
                files: ["en-US.ts"]
            },
            {
                code: "fr-FR",
                name: "Français (France)",
                files: ["fr-FR.ts"]
            },

        ],
        lazy: true,
        langDir: "lang"
    },
    pages:true
});
