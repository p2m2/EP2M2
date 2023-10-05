import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import Components from "unplugin-vue-components/vite";


export default defineConfig({
    plugins:[
        Components({ 
            dirs: ["./components/**", "./components/"], 
            directoryAsNamespace: true,
            // Use Component of Nuxt/UI without prefix
            resolvers:[
                (componentNames) => {
                    // TODO: Get prefix in configuration of Nuxt/ui
                    if(componentNames.startsWith("U")){
                        return {name: componentNames.slice(1), from: "@nuxt/ui"};
                    }                                        
                }
            ]
        }),
        vue(),
    ],
    test: {
        globals: true,
        environment: "jsdom",
        coverage:{
            reporter: ["json-summary", "json"],
            lines: 80,
            branches: 80,
            functions: 80,
            statements: 80
        },
        reporters: ["junit", "json", "verbose"],
        outputFile: {
            junit: "./test/results/results.xml",
            json: "./test/results/results.json"
        },
    },

    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
});