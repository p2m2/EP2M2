import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";


export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: "jsdom",
        coverage:{
            reporter: ["json-summary", "json"]
        }
    },

    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
});