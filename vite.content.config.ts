import { CRX_CONTENT_OUTDIR } from "./global.config";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: CRX_CONTENT_OUTDIR,
    lib: {
      entry: [path.resolve(__dirname, "src/content/index.ts")],
      formats: ["cjs"],
      fileName: () => {
        return "content.js";
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          return "content.css";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // 解决代码中包含process.env.NODE_ENV导致无法使用的问题
  define: {
    "process.env.NODE_ENV": null,
  },
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
});
