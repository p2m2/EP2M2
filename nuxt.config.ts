// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        "@nuxt/ui",
        "@nuxtjs/i18n",
        (_options, nuxt) => {
            nuxt.hooks.hook("vite:extendConfig", (config) => {
            // @ts-expect-error
                config.plugins.push(vuetify({ autoImport: true }));
            });
        },
    ],
    typescript: {
        typeCheck: false
    },
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
    pages:true,
    // thx: https://stackoverflow.com/a/77140279
    app: {
        head: {
            link: [{ rel: "icon", type: "image/ico", href: "/p2m2.ico" }]
        }
    },
    build: {
        transpile: ["vuetify"],
    },
    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
    },
});
