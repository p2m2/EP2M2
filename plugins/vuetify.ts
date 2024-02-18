// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";

export type {tOneSort};

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
    // ... your configuration
    });
    app.vueApp.use(vuetify);
});

declare global {
    interface tOneSort {
        key: string,
        order: "asc" | "desc"
    }
}
