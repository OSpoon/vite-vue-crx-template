import path from "node:path";

import { build } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import fs from "fs-extra";

import {
  CRX_BACKGROUND_OUTDIR,
  CRX_CONTENT_OUTDIR,
  CRX_OUTDIR,
} from "../global.config";

async function buildPopupScript() {
  try {
    await build({
      // 根目录的 vite.config.ts 配置会在执行 build api 时将选项进行合并,容易造成混乱
      configFile: false,
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
      build: {
        outDir: CRX_OUTDIR,
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
    console.log("\x1B[32m✓ [1/3] build popup script success");
  } catch (error) {
    console.error("\x1B[32m× build popup script error", error);
  }
}

async function buildContentScript() {
  try {
    await build({
      configFile: false,
      publicDir: false,
      build: {
        outDir: CRX_CONTENT_OUTDIR,
        lib: {
          entry: [path.resolve(process.cwd(), "src/content/index.ts")],
          formats: ["cjs"],
          fileName: () => "content.js",
        },
        rollupOptions: {
          output: {
            assetFileNames: (_) => {
              return "content.css";
            },
          },
        },
      },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
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
    console.log("\x1B[32m✓ [2/3] build content script success");
  } catch (error) {
    console.log("\x1B[32m× build content script error", error);
  }
}

async function buildBackgroundScript() {
  try {
    await build({
      configFile: false,
      publicDir: false,
      build: {
        outDir: CRX_BACKGROUND_OUTDIR,
        lib: {
          entry: [path.resolve(process.cwd(), "src/background/index.ts")],
          formats: ["cjs"],
          fileName: () => "background.js",
        },
      },
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
      },
    });
    console.log("\x1B[32m✓ [3/3] build background script success");
  } catch (error) {
    console.log("\x1B[32m× build background script error", error);
  }
}

async function copyFileSync(root: string, filename: string) {
  await fs.copyFileSync(
    path.resolve(process.cwd(), `${root}/${filename}`),
    path.resolve(process.cwd(), `${CRX_OUTDIR}/${filename}`)
  );
}

async function removeSync(root: string) {
  await fs.removeSync(path.resolve(process.cwd(), root));
}

async function mergeFiles() {
  await copyFileSync(CRX_CONTENT_OUTDIR, "content.js");
  await copyFileSync(CRX_CONTENT_OUTDIR, "content.css");
  await removeSync(CRX_CONTENT_OUTDIR);

  await copyFileSync(CRX_BACKGROUND_OUTDIR, "background.js");
  await removeSync(CRX_BACKGROUND_OUTDIR);
}

(async () => {
  await buildPopupScript();
  await buildContentScript();
  await buildBackgroundScript();
  await mergeFiles();
  console.log("\x1B[32m✓ build all success");
})();
