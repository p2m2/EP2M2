// SPDX-FileCopyrightText: 2024 Marcellino Palerme <marcellino.palerme@inrae.fr>

// SPDX-License-Identifier: MIT
// import { defineVitestConfig } from "@nuxt/test-utils/config";
// // import Components from "unplugin-vue-components/vite";
// import * as path from "path";

// const r = (p: string) => path.resolve(__dirname, p);

// export default defineVitestConfig({
//     // root:".",
//     // base:".",
//     // plugins:[
//     //     Components({ 
//     //         dirs: ["./components/**", "./components/"], 
//     //         directoryAsNamespace: true,
//     //         // Use Component of Nuxt/UI without prefix
//     //         resolvers:[
//     //             (componentNames) => {
//     //                 // TODO: Get prefix in configuration of Nuxt/ui
//     //                 if(componentNames.startsWith("U")){
//     //                     return {name: componentNames.slice(1), from: "@nuxt/ui"};
//     //                 }                                        
//     //             }
//     //         ]
//     //     }),
//     //     // vue(),
//     // ],
//     test: {
//         globals: true,
//         environment: "jsdom",
//         coverage:{
//             reporter: ["json-summary", "json", "html"],
//             lines: 80,
//             branches: 80,
//             functions: 80,
//             statements: 80,
//             // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
//             reportOnFailure: true,
//             // reportsDirectory: "./test/results/coverage"
//         },
//         reporters: ["junit", "json", "verbose"],
//         outputFile: {
//             junit: "./test/results/results.xml",
//             json: "./test/results/results.json"
//         },
//     },

//     resolve: {
//         alias: {
//             // "@": fileURLToPath(new URL(".", import.meta.url)),
//             "~": r("."),
//             // "#imports":fileURLToPath(new URL("./.nuxt/imports.d.ts", import.meta.url)) 
//         },
//     },
    
// });

import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
    // any custom Vitest config you require
    test: {
        coverage: {
            enabled: true,
            provider: "v8",
            reportOnFailure: true,
            reporter: ["json-summary", "json", "html", "text"]
        },
        globals: true,
        environment: "nuxt",
        // you can optionally set Nuxt-specific environment options
        environmentOptions: {
            nuxt: {
                domEnvironment: "happy-dom", // 'happy-dom' (default) or 'jsdom'
                overrides: {
                    // other Nuxt config you want to pass
                    
                }
            }
        },
        setupFiles: "vitest.setup.ts",
        server: {
            deps: {
                inline: ["vuetify"],
            },
        },
        reporters: ["junit", "verbose"],
        outputFile: {
            junit: "test/results/junit.xml",
        },
    }
});