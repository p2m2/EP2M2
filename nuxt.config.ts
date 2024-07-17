// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
    runtimeConfig: {
        // in dev
        // be overridden by NUXT_URL_P2M2_API_PARSE environment variable
        urlP2m2ApiParse: "http://p2m2ToolsApi:8080/p2m2tools/api/format/parse/",
         // be overridden by NUXT_URL_P2M2_API_SNIF environment variable
        urlP2m2ApiSnif: "http://p2m2ToolsApi:8080/p2m2tools/api/format/sniffer",
        // be overridden by NUXT_PATH_SHARE  environment variable
        pathShare: "/shareFile",
      },
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
            calibCurve: {
                "en-US": "/calibration_curve",
                "fr-FR": "/gammes",
            }
        }
    },
    pages:true,
    // thx: https://stackoverflow.com/a/77140279
    app: {
        head: {
            link: [{ rel: "icon", href: "/p2m2.ico" }]
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