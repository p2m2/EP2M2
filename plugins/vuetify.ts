// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>
//
// SPDX-License-Identifier: MIT

// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";

export type {tOneSort, tHeader};

const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#8bc34a',
    secondary: '#cddc39',
    accent: '#f44336',
    error: '#ff9800',
    warning: '#607d8b',
    info: '#00bcd4',
    success: '#2196f3'
    }
};
export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
    // ... your configuration
    theme: {
        defaultTheme: 'myCustomLightTheme',
        themes: {
          myCustomLightTheme,
        },
      },
            
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
