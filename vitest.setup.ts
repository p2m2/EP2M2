// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT
import { config } from "@vue/test-utils";
import { createI18n,  } from "vue-i18n";
import en from "@/lang/en-US";
import fr from "@/lang/fr-FR";

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: "fr",
    messages: {
        en, 
        fr, 
    },
    locales: [
        {
            code: "en-US",
            name: "English (US)",
            files: ["@/lang/en-US.ts"]
        },
        {
            code: "fr-FR",
            name: "Français (France)",
            files: ["@/lang/fr-FR.ts"]
        },

    ]
});

config.global.plugins = [i18n];
