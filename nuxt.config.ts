// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
    $production: {
        routeRules: {
            "/**": { isr: true }
        }
    },
    $development: {
        routeRules: {
            "/**": { isr: true }
        }
    },
    modules: [
        "@nuxt/ui",
        "@nuxt/test-utils/module",
        "@nuxtjs/eslint-module",
        "@nuxtjs/i18n",
        (_options, nuxt) => {
            nuxt.hooks.hook("vite:extendConfig", (config) => {
                // @ts-expect-error : directly from  vuetify
                config.plugins.push(vuetify({ autoImport: true }));
            });
        },
        "@nuxt/test-utils/module"
    ],
    typescript: {
        typeCheck: false
    },
    i18n: {
        defaultLocale: "fr-FR",
        strategy: "no_prefix",
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
        lazy: false,
        langDir: "lang",
        // customRoutes: "config",   // disable custom route with page components
        pages: {
            index: {
                "en-US": "/",
                "fr-FR": "/",
            },
            serie: {
                "en-US": "/serie",
                "fr-FR": "/serie",
            }
        }
    },
    pages:true,
    // thx: https://stackoverflow.com/a/77140279
    app: {
        head: {
            link: [{ rel: "icon", type: "image/ico", href: "/p2m2.ico" }]
        },
        pageTransition: false,
        layoutTransition: false
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