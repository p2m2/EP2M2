// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";

export type {tOneSort, tHeader};

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
    // ... your configuration
    });
    app.vueApp.use(vuetify);
});

declare global {
    // Define sort
    interface tOneSort {
        key: string,
        order: "asc" | "desc"
    }
    // Define a vetify column
    interface tHeader{ 
        key: string,
        type: string,
        sortable:boolean
    }
}
