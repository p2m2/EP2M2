import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [vue({
        template:{
            compilerOptions:{
                isCustomElement: (tag) => tag.startsWith("U"),
            }
        }
    })],
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
        reporters: ["junit", "json"],
        outputFile: {
            junit: "./test/reporter/result.xml",
            json: "./test/reporter/result.json"
        }
    },

    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
});